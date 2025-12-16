const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar usuários (apenas admin)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.active, u.last_login, u.created_at,
             r.name as role, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Usuário só pode ver seu próprio perfil, exceto admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.active, u.last_login, u.created_at,
             r.name as role, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword, role_id]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'CREATE', 'users', $2, $3, $4)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ name, email }), req.ip]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Usuário só pode editar seu próprio perfil, exceto admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { name, email, avatar_url, role_id, active } = req.body;
    
    // Só admin pode alterar role e status ativo
    const updates = { name, email, avatar_url };
    if (req.user.role === 'admin') {
      if (role_id !== undefined) updates.role_id = role_id;
      if (active !== undefined) updates.active = active;
    }

    const setClause = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates).filter(v => v !== undefined)];

    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 
       RETURNING id, name, email, avatar_url, active`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir auto-exclusão
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'DELETE', 'users', $2, $3, $4)`,
      [req.user.id, id, JSON.stringify({ email: result.rows[0].email }), req.ip]
    );

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar roles disponíveis
router.get('/roles/list', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar roles:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
