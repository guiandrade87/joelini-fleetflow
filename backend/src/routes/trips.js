const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Viagens longas - DEVE vir antes de /:id
router.get('/long/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
             d.name as driver_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.trip_type = 'longa' AND t.travel_log_enabled = true
      ORDER BY t.start_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar viagens longas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de viagens
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, vehicle_id } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_viagens,
        COUNT(*) FILTER (WHERE status = 'finalizada') as finalizadas,
        COUNT(*) FILTER (WHERE status = 'em_andamento') as em_andamento,
        COALESCE(SUM(CASE WHEN km_fim IS NOT NULL AND km_inicio IS NOT NULL 
                         THEN km_fim - km_inicio ELSE 0 END), 0) as total_km
      FROM trips
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_id) {
      query += ` AND vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (start_date) {
      query += ` AND start_at >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND start_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar viagens
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, driver_id, status, trip_type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, 
             v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
             d.name as driver_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_id) {
      query += ` AND t.vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (driver_id) {
      query += ` AND t.driver_id = $${paramIndex++}`;
      params.push(driver_id);
    }

    if (status) {
      query += ` AND t.status = $${paramIndex++}`;
      params.push(status);
    }

    if (trip_type) {
      query += ` AND t.trip_type = $${paramIndex++}`;
      params.push(trip_type);
    }

    const countQuery = query.replace(/SELECT t\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY t.start_at DESC NULLS LAST, t.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar viagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar viagem por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
              d.name as driver_name
       FROM trips t
       LEFT JOIN vehicles v ON t.vehicle_id = v.id
       LEFT JOIN drivers d ON t.driver_id = d.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar viagem
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, purpose, km_inicio, start_at,
      origem, destino, rota, carga, trip_type, travel_log_enabled,
      status, observacoes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO trips (
        vehicle_id, driver_id, purpose, km_inicio, start_at,
        origem, destino, rota, carga, trip_type, travel_log_enabled,
        status, observacoes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        vehicle_id, driver_id, purpose, km_inicio, start_at,
        origem, destino, rota, carga, trip_type || 'curta', travel_log_enabled || false,
        status || 'agendada', observacoes, req.user.id
      ]
    );

    // Atualiza situação do veículo se viagem iniciada
    if (vehicle_id && status === 'em_andamento') {
      await pool.query(
        "UPDATE vehicles SET situacao = 'em_uso' WHERE id = $1",
        [vehicle_id]
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'CREATE', 'trips', $3)`,
      [req.user.id, req.user.name, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar viagem
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const cleanFields = {};
    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined) {
        cleanFields[key] = fields[key];
      }
    });

    if (Object.keys(cleanFields).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const setClause = Object.keys(cleanFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(cleanFields)];

    const result = await pool.query(
      `UPDATE trips SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, changes)
       VALUES ($1, $2, 'UPDATE', 'trips', $3, $4)`,
      [req.user.id, req.user.name, id, JSON.stringify(cleanFields)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar viagem
router.put('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { km_inicio } = req.body;

    const result = await pool.query(
      `UPDATE trips 
       SET status = 'em_andamento', 
           start_at = COALESCE(start_at, NOW()),
           km_inicio = COALESCE($2, km_inicio),
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, km_inicio]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    // Atualiza situação do veículo
    if (result.rows[0].vehicle_id) {
      await pool.query(
        "UPDATE vehicles SET situacao = 'em_uso' WHERE id = $1",
        [result.rows[0].vehicle_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao iniciar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finalizar viagem
router.put('/:id/finish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { km_fim, observacoes } = req.body;

    const result = await pool.query(
      `UPDATE trips 
       SET status = 'finalizada', 
           end_at = NOW(),
           km_fim = $2,
           observacoes = COALESCE($3, observacoes),
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, km_fim, observacoes]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    // Retorna veículo para ativo e atualiza odômetro
    if (result.rows[0].vehicle_id) {
      await pool.query(
        "UPDATE vehicles SET situacao = 'ativo', odometro = GREATEST(odometro, $2) WHERE id = $1",
        [result.rows[0].vehicle_id, km_fim]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao finalizar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar viagem
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      `UPDATE trips 
       SET status = 'cancelada', 
           observacoes = COALESCE($2, observacoes),
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, reason]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    // Retorna veículo para ativo se estava em uso
    if (result.rows[0].vehicle_id) {
      await pool.query(
        "UPDATE vehicles SET situacao = 'ativo' WHERE id = $1 AND situacao = 'em_uso'",
        [result.rows[0].vehicle_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cancelar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar viagem
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 RETURNING id, vehicle_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'DELETE', 'trips', $3)`,
      [req.user.id, req.user.name, id]
    );

    res.json({ message: 'Viagem excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
