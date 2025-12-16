-- Sistema de Controle de Migrations
-- Joelini FleetFlow

-- Tabela para controlar versões das migrations executadas
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64),
    execution_time_ms INTEGER
);

-- Comentário da tabela
COMMENT ON TABLE schema_migrations IS 'Controle de versões das migrations do banco de dados';

-- Função para registrar migration executada
CREATE OR REPLACE FUNCTION register_migration(
    p_version VARCHAR(50),
    p_name VARCHAR(255),
    p_checksum VARCHAR(64) DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_execution_time INTEGER;
BEGIN
    v_start_time := clock_timestamp();
    
    INSERT INTO schema_migrations (version, name, checksum, execution_time_ms)
    VALUES (
        p_version, 
        p_name, 
        p_checksum,
        EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time))::INTEGER
    )
    ON CONFLICT (version) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se migration já foi executada
CREATE OR REPLACE FUNCTION migration_exists(p_version VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM schema_migrations WHERE version = p_version);
END;
$$ LANGUAGE plpgsql;

-- Registrar versão inicial
SELECT register_migration('001', 'initial_schema', NULL);
SELECT register_migration('002', 'seed_data', NULL);

-- View para listar migrations
CREATE OR REPLACE VIEW v_migrations AS
SELECT 
    version,
    name,
    executed_at,
    checksum,
    execution_time_ms
FROM schema_migrations
ORDER BY version;
