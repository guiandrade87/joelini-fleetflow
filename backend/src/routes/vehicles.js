const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar todos os veículos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { situacao, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (situacao) {
      query += ` AND situacao = $${paramIndex++}`;
      params.push(situacao);
    }

    if (search) {
      query += ` AND (placa ILIKE $${paramIndex} OR modelo ILIKE $${paramIndex} OR marca ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count total
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*)'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    query += ` ORDER BY placa ASC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de veículos - IMPORTANTE: deve vir antes de /:id
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE situacao = 'ativo') as ativos,
        COUNT(*) FILTER (WHERE situacao = 'manutencao') as manutencao,
        COUNT(*) FILTER (WHERE situacao = 'inativo') as inativos,
        COUNT(*) FILTER (WHERE situacao = 'vendido') as vendidos
      FROM vehicles
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Lista simplificada para selects
router.get('/available/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, placa, modelo, marca, combustivel FROM vehicles WHERE situacao = 'ativo' ORDER BY placa`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar veículos disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar veículo por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar veículo
router.post('/', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const {
      placa, renavam, chassi, modelo, marca, ano, cor,
      categoria, combustivel, odometro, situacao, proprietario,
      centro_custo, filial, veiculo_img_url, crlv_url, seguro_url,
      seguro_vencimento, observacoes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (
        placa, renavam, chassi, modelo, marca, ano, cor,
        categoria, combustivel, odometro, situacao, proprietario,
        centro_custo, filial, veiculo_img_url, crlv_url, seguro_url,
        seguro_vencimento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        placa, renavam, chassi, modelo, marca, ano, cor,
        categoria || 'utilitario', combustivel || 'flex', odometro || 0,
        situacao || 'ativo', proprietario, centro_custo, filial,
        veiculo_img_url, crlv_url, seguro_url, seguro_vencimento
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, entity_name)
       VALUES ($1, $2, 'CREATE', 'vehicles', $3, $4)`,
      [req.user.id, req.user.name, result.rows[0].id, placa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar veículo
router.put('/:id', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    // Remove campos undefined/null
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
      `UPDATE vehicles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, changes)
       VALUES ($1, $2, 'UPDATE', 'vehicles', $3, $4)`,
      [req.user.id, req.user.name, id, JSON.stringify(cleanFields)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar veículo
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM vehicles WHERE id = $1 RETURNING placa',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, entity_name)
       VALUES ($1, $2, 'DELETE', 'vehicles', $3, $4)`,
      [req.user.id, req.user.name, id, result.rows[0].placa]
    );

    res.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
