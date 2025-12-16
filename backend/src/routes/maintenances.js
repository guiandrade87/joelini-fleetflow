const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar manutenções
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, status, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT m.*, 
             v.plate as vehicle_plate, v.model as vehicle_model
      FROM maintenances m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_id) {
      query += ` AND m.vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (status) {
      query += ` AND m.status = $${paramIndex++}`;
      params.push(status);
    }

    if (type) {
      query += ` AND m.type = $${paramIndex++}`;
      params.push(type);
    }

    const countQuery = query.replace(/SELECT m\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY m.scheduled_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar manutenções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
              v.plate as vehicle_plate, v.model as vehicle_model
       FROM maintenances m
       JOIN vehicles v ON m.vehicle_id = v.id
       WHERE m.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar manutenção
router.post('/', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const {
      vehicle_id, type, description, scheduled_date, scheduled_km,
      estimated_cost, workshop, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenances (
        vehicle_id, type, description, scheduled_date, scheduled_km,
        estimated_cost, workshop, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'agendada', $8)
      RETURNING *`,
      [vehicle_id, type, description, scheduled_date, scheduled_km, estimated_cost, workshop, notes]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'CREATE', 'maintenances', $2, $3, $4)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ vehicle_id, type }), req.ip]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar manutenção
router.put('/:id/start', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;

    const maintenanceResult = await pool.query(
      'SELECT vehicle_id FROM maintenances WHERE id = $1',
      [id]
    );

    if (maintenanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE maintenances 
         SET status = 'em_andamento', start_date = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      // Colocar veículo em manutenção
      await client.query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['manutencao', maintenanceResult.rows[0].vehicle_id]
      );

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao iniciar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finalizar manutenção
router.put('/:id/finish', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_cost, completion_km, notes } = req.body;

    const maintenanceResult = await pool.query(
      'SELECT vehicle_id FROM maintenances WHERE id = $1',
      [id]
    );

    if (maintenanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE maintenances 
         SET status = 'concluida', completion_date = NOW(), actual_cost = $1, 
             completion_km = $2, notes = COALESCE($3, notes)
         WHERE id = $4
         RETURNING *`,
        [actual_cost, completion_km, notes, id]
      );

      // Liberar veículo
      await client.query(
        'UPDATE vehicles SET status = $1, current_km = GREATEST(current_km, $2) WHERE id = $3',
        ['disponivel', completion_km || 0, maintenanceResult.rows[0].vehicle_id]
      );

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao finalizar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar manutenção
router.put('/:id', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(fields)];

    const result = await pool.query(
      `UPDATE maintenances SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar manutenção
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM maintenances WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    res.json({ message: 'Manutenção excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Próximas manutenções
router.get('/upcoming/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, v.plate, v.model
      FROM maintenances m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status IN ('agendada', 'em_andamento')
      AND m.scheduled_date >= CURRENT_DATE
      ORDER BY m.scheduled_date ASC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar próximas manutenções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
