const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Estatísticas de combustível - DEVE vir antes de /:id
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total_abastecimentos,
        COALESCE(SUM(litros), 0) as total_litros,
        COALESCE(SUM(valor_total), 0) as custo_total,
        COALESCE(AVG(valor_litro), 0) as preco_medio_litro
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
      query += ` AND data >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND data <= $${paramIndex++}`;
      params.push(end_date);
    }

    const result = await pool.query(query, params);
    const stats = result.rows[0];

    res.json({
      totalCost: parseFloat(stats.custo_total) || 0,
      totalLiters: parseFloat(stats.total_litros) || 0,
      avgPricePerLiter: parseFloat(stats.preco_medio_litro) || 0,
      count: parseInt(stats.total_abastecimentos) || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar abastecimentos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, driver_id, tipo_combustivel, start_date, end_date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT f.*, 
             v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
             d.name as driver_name
      FROM fuelings f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN drivers d ON f.driver_id = d.id
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

    if (tipo_combustivel) {
      query += ` AND f.tipo_combustivel = $${paramIndex++}`;
      params.push(tipo_combustivel);
    }

    if (start_date) {
      query += ` AND f.data >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND f.data <= $${paramIndex++}`;
      params.push(end_date);
    }

    const countQuery = query.replace(/SELECT f\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY f.data DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
              v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
              d.name as driver_name
       FROM fuelings f
       LEFT JOIN vehicles v ON f.vehicle_id = v.id
       LEFT JOIN drivers d ON f.driver_id = d.id
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
      vehicle_id, driver_id, trip_id, data, km, litros,
      valor_litro, valor_total, tipo_combustivel, posto,
      cidade, nota_url, observacoes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO fuelings (
        vehicle_id, driver_id, trip_id, data, km, litros,
        valor_litro, valor_total, tipo_combustivel, posto,
        cidade, nota_url, observacoes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        vehicle_id, driver_id, trip_id, data || new Date(), km, litros,
        valor_litro, valor_total, tipo_combustivel || 'gasolina', posto,
        cidade, nota_url, observacoes, req.user.id
      ]
    );

    // Atualizar odômetro do veículo
    if (km && vehicle_id) {
      await pool.query(
        'UPDATE vehicles SET odometro = GREATEST(odometro, $1) WHERE id = $2',
        [km, vehicle_id]
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'CREATE', 'fuelings', $3)`,
      [req.user.id, req.user.name, result.rows[0].id]
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
      `UPDATE fuelings SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abastecimento não encontrado' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, changes)
       VALUES ($1, $2, 'UPDATE', 'fuelings', $3, $4)`,
      [req.user.id, req.user.name, id, JSON.stringify(cleanFields)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar abastecimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar abastecimento
router.delete('/:id', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM fuelings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abastecimento não encontrado' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'DELETE', 'fuelings', $3)`,
      [req.user.id, req.user.name, id]
    );

    res.json({ message: 'Abastecimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar abastecimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
