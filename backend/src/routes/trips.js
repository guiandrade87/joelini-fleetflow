const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar todas as viagens
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, vehicle_id, driver_id, start_date, end_date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, 
             v.plate as vehicle_plate, v.model as vehicle_model,
             d.name as driver_name
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND t.status = $${paramIndex++}`;
      params.push(status);
    }

    if (vehicle_id) {
      query += ` AND t.vehicle_id = $${paramIndex++}`;
      params.push(vehicle_id);
    }

    if (driver_id) {
      query += ` AND t.driver_id = $${paramIndex++}`;
      params.push(driver_id);
    }

    if (start_date) {
      query += ` AND t.start_date >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND t.start_date <= $${paramIndex++}`;
      params.push(end_date);
    }

    const countQuery = query.replace(/SELECT t\.\*.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY t.start_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
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
    console.error('Erro ao listar viagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar viagem por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
              v.plate as vehicle_plate, v.model as vehicle_model,
              d.name as driver_name
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       JOIN drivers d ON t.driver_id = d.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar viagem
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      vehicle_id, driver_id, purpose, origin, destination,
      start_date, start_km, expected_return, notes
    } = req.body;

    // Verificar se veículo está disponível
    const vehicleCheck = await pool.query(
      'SELECT status FROM vehicles WHERE id = $1',
      [vehicle_id]
    );

    if (vehicleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    if (vehicleCheck.rows[0].status !== 'disponivel') {
      return res.status(400).json({ error: 'Veículo não está disponível' });
    }

    // Verificar se motorista está disponível
    const driverCheck = await pool.query(
      'SELECT status FROM drivers WHERE id = $1',
      [driver_id]
    );

    if (driverCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    if (driverCheck.rows[0].status !== 'ativo') {
      return res.status(400).json({ error: 'Motorista não está ativo' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Criar viagem
      const result = await client.query(
        `INSERT INTO trips (
          vehicle_id, driver_id, purpose, origin, destination,
          start_date, start_km, expected_return, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'em_andamento', $9)
        RETURNING *`,
        [vehicle_id, driver_id, purpose, origin, destination, start_date, start_km, expected_return, notes]
      );

      // Atualizar status do veículo
      await client.query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['em_uso', vehicle_id]
      );

      await client.query('COMMIT');

      // Audit log
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
         VALUES ($1, 'CREATE', 'trips', $2, $3, $4)`,
        [req.user.id, result.rows[0].id, JSON.stringify({ vehicle_id, driver_id, origin, destination }), req.ip]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finalizar viagem
router.put('/:id/finish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { end_date, end_km, notes } = req.body;

    const tripResult = await pool.query(
      'SELECT vehicle_id, start_km FROM trips WHERE id = $1',
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    const trip = tripResult.rows[0];

    if (end_km < trip.start_km) {
      return res.status(400).json({ error: 'KM final não pode ser menor que KM inicial' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Finalizar viagem
      const result = await client.query(
        `UPDATE trips 
         SET end_date = $1, end_km = $2, status = 'concluida', notes = COALESCE($3, notes)
         WHERE id = $4
         RETURNING *`,
        [end_date, end_km, notes, id]
      );

      // Atualizar KM do veículo e liberar
      await client.query(
        'UPDATE vehicles SET current_km = $1, status = $2 WHERE id = $3',
        [end_km, 'disponivel', trip.vehicle_id]
      );

      await client.query('COMMIT');

      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
         VALUES ($1, 'UPDATE', 'trips', $2, $3, $4)`,
        [req.user.id, id, JSON.stringify({ action: 'finish', end_km }), req.ip]
      );

      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao finalizar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar viagem
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tripResult = await pool.query(
      'SELECT vehicle_id, status FROM trips WHERE id = $1',
      [id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }

    const trip = tripResult.rows[0];

    if (trip.status === 'concluida') {
      return res.status(400).json({ error: 'Não é possível cancelar viagem concluída' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE trips 
         SET status = 'cancelada', notes = COALESCE(notes || ' - Cancelada: ', 'Cancelada: ') || $1
         WHERE id = $2
         RETURNING *`,
        [reason || 'Sem motivo informado', id]
      );

      // Liberar veículo
      await client.query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['disponivel', trip.vehicle_id]
      );

      await client.query('COMMIT');

      res.json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao cancelar viagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
