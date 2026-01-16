#!/usr/bin/env node
// Script para gerar hash bcrypt para senhas
// Uso: node generate-hash.js <senha>

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'joelini123';
const hash = bcrypt.hashSync(password, 10);

console.log(`Senha: ${password}`);
console.log(`Hash: ${hash}`);
