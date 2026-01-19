const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Lista simplificada para selects - DEVE vir antes de /:id
router.get('/available/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, cnh_num, cnh_categoria, telefone 
       FROM drivers 
       WHERE habilitado = true 
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar motoristas disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos os motoristas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM drivers WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status === 'habilitado') {
      query += ` AND habilitado = true`;
    } else if (status === 'inabilitado') {
      query += ` AND habilitado = false`;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR cpf ILIKE $${paramIndex} OR cnh_num ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*)'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar motoristas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar motorista por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM drivers WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar motorista
router.post('/', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const {
      name, cpf, rg, telefone, email, endereco,
      cnh_num, cnh_categoria, cnh_validade, cnh_url,
      habilitado, observacoes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (
        name, cpf, rg, telefone, email, endereco,
        cnh_num, cnh_categoria, cnh_validade, cnh_url,
        habilitado, observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        name, cpf, rg, telefone, email, endereco,
        cnh_num, cnh_categoria, cnh_validade, cnh_url,
        habilitado !== false, observacoes
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, entity_name)
       VALUES ($1, $2, 'CREATE', 'drivers', $3, $4)`,
      [req.user.id, req.user.name, result.rows[0].id, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar motorista:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CPF ou CNH já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar motorista
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
      `UPDATE drivers SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, changes)
       VALUES ($1, $2, 'UPDATE', 'drivers', $3, $4)`,
      [req.user.id, req.user.name, id, JSON.stringify(cleanFields)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar motorista
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM drivers WHERE id = $1 RETURNING name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action, entity, entity_id, entity_name)
       VALUES ($1, $2, 'DELETE', 'drivers', $3, $4)`,
      [req.user.id, req.user.name, id, result.rows[0].name]
    );

    res.json({ message: 'Motorista excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
