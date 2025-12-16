const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar logs de auditoria (apenas admin/gestor)
router.get('/', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const { 
      user_id, action, entity, start_date, end_date, 
      page = 1, limit = 50 
    } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND a.user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    if (action) {
      query += ` AND a.action = $${paramIndex++}`;
      params.push(action);
    }

    if (entity) {
      query += ` AND a.entity = $${paramIndex++}`;
      params.push(entity);
    }

    if (start_date) {
      query += ` AND a.created_at >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND a.created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    const countQuery = query.replace(/SELECT a\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar log por ID
router.get('/:id', authenticateToken, requireRole('admin', 'gestor_frota'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de auditoria
router.get('/stats/summary', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as usuarios_ativos,
        COUNT(*) FILTER (WHERE action = 'LOGIN') as total_logins,
        COUNT(*) FILTER (WHERE action = 'CREATE') as total_creates,
        COUNT(*) FILTER (WHERE action = 'UPDATE') as total_updates,
        COUNT(*) FILTER (WHERE action = 'DELETE') as total_deletes,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as logs_hoje
      FROM audit_logs
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Ações por entidade
router.get('/stats/by-entity', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT entity, action, COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY entity, action
      ORDER BY entity, count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar estatísticas por entidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atividade por usuário
router.get('/stats/by-user', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, COUNT(a.id) as total_acoes
      FROM users u
      LEFT JOIN audit_logs a ON u.id = a.user_id AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_acoes DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar estatísticas por usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
