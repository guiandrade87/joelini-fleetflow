#!/bin/bash
# ===================================
# Script de Backup - PostgreSQL
# Sistema de Gestão de Frota Joelini
# ===================================

set -e

# Configurações
BACKUP_DIR="/var/backups/joelini-frota"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/frota_joelini_$DATE.sql.gz"
RETENTION_DAYS=30

# Variáveis do banco (ajuste conforme necessário)
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5434}"
DB_NAME="${POSTGRES_DB:-frota_joelini}"
DB_USER="${POSTGRES_USER:-joelini}"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

echo "$(date): Iniciando backup do banco $DB_NAME..."

# Executar backup
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME \
    --format=plain \
    --no-owner \
    --no-privileges \
    | gzip > $BACKUP_FILE

# Verificar se o backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "$(date): Backup criado com sucesso: $BACKUP_FILE ($SIZE)"
else
    echo "$(date): ERRO - Falha ao criar backup!"
    exit 1
fi

# Remover backups antigos
echo "$(date): Removendo backups com mais de $RETENTION_DAYS dias..."
find $BACKUP_DIR -name "frota_joelini_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Listar backups existentes
echo "$(date): Backups disponíveis:"
ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado"

echo "$(date): Processo de backup finalizado."
