const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar configurações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT key, value, description FROM settings ORDER BY key'
    );
    
    // Converter para objeto
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description
      };
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar configuração específica
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT key, value, description FROM settings WHERE key = $1',
      [req.params.key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configuração (apenas admin)
router.put('/:key', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const result = await pool.query(
      `UPDATE settings SET value = $1 WHERE key = $2 RETURNING *`,
      [value, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'UPDATE', 'settings', $2, $3, $4)`,
      [req.user.id, key, JSON.stringify({ key, value }), req.ip]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar múltiplas configurações (apenas admin)
router.put('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const settings = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          'UPDATE settings SET value = $1 WHERE key = $2',
          [value, key]
        );
      }

      await client.query('COMMIT');

      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
         VALUES ($1, 'UPDATE', 'settings', 'batch', $2, $3)`,
        [req.user.id, JSON.stringify(settings), req.ip]
      );

      res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova configuração (apenas admin)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { key, value, description } = req.body;

    const result = await pool.query(
      `INSERT INTO settings (key, value, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [key, value, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Chave já existe' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
