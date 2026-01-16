const { Pool } = require('pg');

// No Docker, a porta interna é sempre 5432 (a porta externa 5434 é só para acesso externo)
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
