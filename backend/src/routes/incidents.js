const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar ocorrências
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, driver_id, tipo, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT i.*, 
             v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
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

    if (tipo) {
      query += ` AND i.tipo = $${paramIndex++}`;
      params.push(tipo);
    }

    if (status) {
      query += ` AND i.status = $${paramIndex++}`;
      params.push(status);
    }

    const countQuery = query.replace(/SELECT i\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY i.data DESC, i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar ocorrências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, 
              v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca,
              d.name as driver_name
       FROM incidents i
       LEFT JOIN vehicles v ON i.vehicle_id = v.id
       LEFT JOIN drivers d ON i.driver_id = d.id
       WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar ocorrência
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, trip_id, tipo, subtipo, descricao,
      valor, data, local, status, responsavel, bo_numero,
      anexo_url, observacoes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO incidents (
        vehicle_id, driver_id, trip_id, tipo, subtipo, descricao,
        valor, data, local, status, responsavel, bo_numero,
        anexo_url, observacoes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        vehicle_id, driver_id, trip_id, tipo, subtipo, descricao,
        valor, data, local, status || 'aberto', responsavel, bo_numero,
        anexo_url, observacoes, req.user.id
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'CREATE', 'incidents', $3)`,
      [req.user.id, req.user.name, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar ocorrência
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
      `UPDATE incidents SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, changes)
       VALUES ($1, $2, 'UPDATE', 'incidents', $3, $4)`,
      [req.user.id, req.user.name, id, JSON.stringify(cleanFields)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Resolver ocorrência
router.put('/:id/resolve', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const { observacoes, valor } = req.body;

    const result = await pool.query(
      `UPDATE incidents 
       SET status = 'resolvido', 
           observacoes = COALESCE($2, observacoes),
           valor = COALESCE($3, valor),
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, observacoes, valor]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao resolver ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar ocorrência
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM incidents WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'DELETE', 'incidents', $3)`,
      [req.user.id, req.user.name, id]
    );

    res.json({ message: 'Ocorrência excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ocorrência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
