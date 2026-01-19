const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Próximas manutenções - DEVE vir antes de /:id
router.get('/upcoming/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, 
             v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca
      FROM maintenances m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status IN ('agendada', 'em_execucao')
      ORDER BY m.data_entrada ASC NULLS LAST
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar próximas manutenções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar manutenções
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, status, tipo, prioridade, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT m.*, 
             v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca
      FROM maintenances m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
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

    if (tipo) {
      query += ` AND m.tipo = $${paramIndex++}`;
      params.push(tipo);
    }

    if (prioridade) {
      query += ` AND m.prioridade = $${paramIndex++}`;
      params.push(prioridade);
    }

    const countQuery = query.replace(/SELECT m\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY m.data_entrada DESC NULLS LAST, m.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
              v.placa as vehicle_placa, v.modelo as vehicle_modelo, v.marca as vehicle_marca
       FROM maintenances m
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
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
      vehicle_id, trip_id, tipo, categoria, descricao, fornecedor,
      custo, pecas, data_entrada, data_exec, proxima_data, proxima_km,
      status, prioridade, anexo_url, nota_url, observacoes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO maintenances (
        vehicle_id, trip_id, tipo, categoria, descricao, fornecedor,
        custo, pecas, data_entrada, data_exec, proxima_data, proxima_km,
        status, prioridade, anexo_url, nota_url, observacoes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        vehicle_id, trip_id, tipo, categoria, descricao, fornecedor,
        custo, pecas, data_entrada, data_exec, proxima_data, proxima_km,
        status || 'agendada', prioridade || 'normal', anexo_url, nota_url, observacoes, req.user.id
      ]
    );

    // Atualiza situação do veículo para manutenção se iniciada
    if (vehicle_id && status === 'em_execucao') {
      await pool.query(
        "UPDATE vehicles SET situacao = 'manutencao' WHERE id = $1",
        [vehicle_id]
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'CREATE', 'maintenances', $3)`,
      [req.user.id, req.user.name, result.rows[0].id]
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

    const result = await pool.query(
      `UPDATE maintenances 
       SET status = 'em_execucao', data_entrada = COALESCE(data_entrada, CURRENT_DATE), updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    // Atualiza situação do veículo
    if (result.rows[0].vehicle_id) {
      await pool.query(
        "UPDATE vehicles SET situacao = 'manutencao' WHERE id = $1",
        [result.rows[0].vehicle_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao iniciar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Concluir manutenção
router.put('/:id/finish', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const { custo, pecas, observacoes, proxima_data, proxima_km } = req.body;

    const result = await pool.query(
      `UPDATE maintenances 
       SET status = 'concluida', 
           data_exec = CURRENT_DATE,
           custo = COALESCE($2, custo),
           pecas = COALESCE($3, pecas),
           observacoes = COALESCE($4, observacoes),
           proxima_data = COALESCE($5, proxima_data),
           proxima_km = COALESCE($6, proxima_km),
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, custo, pecas, observacoes, proxima_data, proxima_km]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    // Retorna veículo para ativo
    if (result.rows[0].vehicle_id) {
      await pool.query(
        "UPDATE vehicles SET situacao = 'ativo' WHERE id = $1",
        [result.rows[0].vehicle_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao concluir manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar manutenção
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
      `UPDATE maintenances SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, changes)
       VALUES ($1, $2, 'UPDATE', 'maintenances', $3, $4)`,
      [req.user.id, req.user.name, id, JSON.stringify(cleanFields)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar manutenção
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM maintenances WHERE id = $1 RETURNING id, vehicle_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manutenção não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id)
       VALUES ($1, $2, 'DELETE', 'maintenances', $3)`,
      [req.user.id, req.user.name, id]
    );

    res.json({ message: 'Manutenção excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar manutenção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
