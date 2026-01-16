const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const vehiclesRoutes = require('./routes/vehicles');
const driversRoutes = require('./routes/drivers');
const tripsRoutes = require('./routes/trips');
const fuelingsRoutes = require('./routes/fuelings');
const maintenancesRoutes = require('./routes/maintenances');
const incidentsRoutes = require('./routes/incidents');
const usersRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const auditRoutes = require('./routes/audit');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/fuelings', fuelingsRoutes);
app.use('/api/maintenances', maintenancesRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
