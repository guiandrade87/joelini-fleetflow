#!/bin/bash
# ===================================
# Script de Restore - PostgreSQL
# Sistema de Gestão de Frota Joelini
# ===================================

set -e

# Verificar parâmetro
if [ -z "$1" ]; then
    echo "Uso: $0 <arquivo_backup.sql.gz>"
    echo ""
    echo "Backups disponíveis:"
    ls -lh /var/backups/joelini-frota/*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE=$1

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERRO: Arquivo $BACKUP_FILE não encontrado!"
    exit 1
fi

# Variáveis do banco
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-frota_joelini}"
DB_USER="${POSTGRES_USER:-joelini}"

echo "=========================================="
echo "ATENÇÃO: Este processo irá SUBSTITUIR"
echo "todos os dados do banco $DB_NAME!"
echo "=========================================="
read -p "Deseja continuar? (digite 'sim' para confirmar): " CONFIRM

if [ "$CONFIRM" != "sim" ]; then
    echo "Operação cancelada."
    exit 0
fi

echo "$(date): Iniciando restore do backup $BACKUP_FILE..."

# Dropar e recriar banco
echo "$(date): Recriando banco de dados..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;"

PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restaurar backup
echo "$(date): Restaurando dados..."
gunzip -c $BACKUP_FILE | PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME

echo "$(date): Restore finalizado com sucesso!"
