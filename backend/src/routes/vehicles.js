const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar todos os veículos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (plate ILIKE $${paramIndex} OR model ILIKE $${paramIndex} OR brand ILIKE $${paramIndex})`;
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
    query += ` ORDER BY plate ASC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
      plate, renavam, chassis, model, brand, year, color,
      fuel_type, tank_capacity, current_km, status, acquisition_date,
      acquisition_value, photo_url, insurance_policy, insurance_expiry,
      ipva_expiry, licensing_expiry, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (
        plate, renavam, chassis, model, brand, year, color,
        fuel_type, tank_capacity, current_km, status, acquisition_date,
        acquisition_value, photo_url, insurance_policy, insurance_expiry,
        ipva_expiry, licensing_expiry, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        plate, renavam, chassis, model, brand, year, color,
        fuel_type, tank_capacity, current_km || 0, status || 'disponivel',
        acquisition_date, acquisition_value, photo_url, insurance_policy,
        insurance_expiry, ipva_expiry, licensing_expiry, notes
      ]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'CREATE', 'vehicles', $2, $3, $4)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ plate }), req.ip]
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
    
    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(fields)];

    const result = await pool.query(
      `UPDATE vehicles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'UPDATE', 'vehicles', $2, $3, $4)`,
      [req.user.id, id, JSON.stringify(fields), req.ip]
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
      'DELETE FROM vehicles WHERE id = $1 RETURNING plate',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
       VALUES ($1, 'DELETE', 'vehicles', $2, $3, $4)`,
      [req.user.id, id, JSON.stringify({ plate: result.rows[0].plate }), req.ip]
    );

    res.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de veículos
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'disponivel') as disponiveis,
        COUNT(*) FILTER (WHERE status = 'em_uso') as em_uso,
        COUNT(*) FILTER (WHERE status = 'manutencao') as manutencao,
        COUNT(*) FILTER (WHERE status = 'inativo') as inativos
      FROM vehicles
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
