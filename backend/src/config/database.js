const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://joelini:joelini2024@db:5432/frota_joelini'
});

pool.on('connect', () => {
  console.log('📦 Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com PostgreSQL:', err);
});

module.exports = pool;
