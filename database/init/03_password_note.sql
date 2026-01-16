-- Migration: Gerar senhas válidas para usuários
-- Este script será executado após a criação do schema

-- A senha padrão "joelini123" é definida diretamente no código do backend
-- quando necessário. Este arquivo existe apenas para documentação.

-- Para alterar a senha de um usuário, use a rota PUT /api/auth/password
-- ou execute manualmente no banco:
--
-- UPDATE users SET password_hash = '<hash_bcrypt>' WHERE email = '<email>';
--
-- Para gerar um hash válido, use:
-- cd backend && node scripts/generate-hash.js <nova_senha>
