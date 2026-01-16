const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// Função para inicializar senhas padrão
async function initializePasswords() {
  try {
    // Aguardar o banco estar pronto
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se o admin tem uma senha válida
    const result = await pool.query(
      "SELECT id, password_hash FROM users WHERE email = 'admin@joelini.com.br'"
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Tentar validar a senha atual
      try {
        const isValid = await bcrypt.compare('joelini123', user.password_hash);
        if (!isValid) {
          // Hash inválido, gerar um novo
          console.log('🔑 Atualizando senhas padrão...');
          const newHash = await bcrypt.hash('joelini123', 10);
          await pool.query('UPDATE users SET password_hash = $1', [newHash]);
          console.log('✅ Senhas atualizadas com sucesso!');
        } else {
          console.log('✅ Senhas já estão configuradas corretamente');
        }
      } catch (e) {
        // Hash inválido, gerar um novo
        console.log('🔑 Hash inválido detectado, atualizando senhas...');
        const newHash = await bcrypt.hash('joelini123', 10);
        await pool.query('UPDATE users SET password_hash = $1', [newHash]);
        console.log('✅ Senhas atualizadas com sucesso!');
      }
    }
  } catch (error) {
    console.error('⚠️ Erro ao inicializar senhas (banco pode não estar pronto):', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}/api`);
  
  // Inicializar senhas padrão após o servidor iniciar
  await initializePasswords();
});
