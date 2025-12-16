const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar incidentes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, driver_id, type, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT i.*, 
             v.plate as vehicle_plate, v.model as vehicle_model,
             d.name as driver_name
      FROM incidents i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      LEFT JOIN drivers d ON i.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_id) {
      query += ` AND i.vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (driver_id) {
      query += ` AND i.driver_id = $${paramIndex++}`;
      params.push(driver_id);
    }

    if (type) {
      query += ` AND i.type = $${paramIndex++}`;
      params.push(type);
    }

    if (status) {
      query += ` AND i.status = $${paramIndex++}`;
      params.push(status);
    }

    const countQuery = query.replace(/SELECT i\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY i.date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar incidentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, 
              v.plate as vehicle_plate, v.model as vehicle_model,
              d.name as driver_name
       FROM incidents i
       LEFT JOIN vehicles v ON i.vehicle_id = v.id
       LEFT JOIN drivers d ON i.driver_id = d.id
       WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar incidente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar incidente
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, type, date, description, location,
      severity, estimated_cost, photos, boletim_ocorrencia, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO incidents (
        vehicle_id, driver_id, type, date, description, location,
        severity, estimated_cost, photos, boletim_ocorrencia, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'aberto', $11)
      RETURNING *`,
      [
        vehicle_id, driver_id, type, date, description, location,
        severity, estimated_cost, photos, boletim_ocorrencia, notes
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'CREATE', 'incidents', $2, $3, $4)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ type, vehicle_id }), req.ip]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar incidente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar incidente
router.put('/:id', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(fields)];

    const result = await pool.query(
      `UPDATE incidents SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar incidente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Resolver incidente
router.put('/:id/resolve', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, actual_cost } = req.body;

    const result = await pool.query(
      `UPDATE incidents 
       SET status = 'resolvido', resolution = $1, actual_cost = $2, resolution_date = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [resolution, actual_cost, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao resolver incidente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar incidente
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM incidents WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incidente não encontrado' });
    }

    res.json({ message: 'Incidente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar incidente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
