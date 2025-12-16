const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar abastecimentos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, driver_id, start_date, end_date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT f.*, 
             v.plate as vehicle_plate, v.model as vehicle_model,
             d.name as driver_name
      FROM fuelings f
      JOIN vehicles v ON f.vehicle_id = v.id
      JOIN drivers d ON f.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_id) {
      query += ` AND f.vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (driver_id) {
      query += ` AND f.driver_id = $${paramIndex++}`;
      params.push(driver_id);
    }

    if (start_date) {
      query += ` AND f.date >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND f.date <= $${paramIndex++}`;
      params.push(end_date);
    }

    const countQuery = query.replace(/SELECT f\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY f.date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar abastecimentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, 
              v.plate as vehicle_plate, v.model as vehicle_model,
              d.name as driver_name
       FROM fuelings f
       JOIN vehicles v ON f.vehicle_id = v.id
       JOIN drivers d ON f.driver_id = d.id
       WHERE f.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abastecimento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar abastecimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar abastecimento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, date, fuel_type, liters,
      price_per_liter, total_cost, current_km, gas_station,
      payment_method, receipt_number, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO fuelings (
        vehicle_id, driver_id, date, fuel_type, liters,
        price_per_liter, total_cost, current_km, gas_station,
        payment_method, receipt_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        vehicle_id, driver_id, date, fuel_type, liters,
        price_per_liter, total_cost, current_km, gas_station,
        payment_method, receipt_number, notes
      ]
    );

    // Atualizar KM do veículo
    await pool.query(
      'UPDATE vehicles SET current_km = $1 WHERE id = $2 AND current_km < $1',
      [current_km, vehicle_id]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'CREATE', 'fuelings', $2, $3, $4)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ vehicle_id, liters, total_cost }), req.ip]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar abastecimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar abastecimento
router.put('/:id', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(fields)];

    const result = await pool.query(
      `UPDATE fuelings SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abastecimento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar abastecimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar abastecimento
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM fuelings WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abastecimento não encontrado' });
    }

    res.json({ message: 'Abastecimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar abastecimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de combustível
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_abastecimentos,
        COALESCE(SUM(liters), 0) as total_litros,
        COALESCE(SUM(total_cost), 0) as custo_total,
        COALESCE(AVG(price_per_liter), 0) as preco_medio_litro
      FROM fuelings
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vehicle_id) {
      query += ` AND vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (start_date) {
      query += ` AND date >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND date <= $${paramIndex++}`;
      params.push(end_date);
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
