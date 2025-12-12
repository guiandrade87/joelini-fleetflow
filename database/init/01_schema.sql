-- Sistema de Gestão de Frota - Joelini
-- Schema Principal

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles/Perfis
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    phone TEXT,
    avatar_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veículos
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    placa TEXT UNIQUE NOT NULL,
    renavam TEXT,
    chassi TEXT,
    modelo TEXT NOT NULL,
    marca TEXT,
    ano INTEGER,
    cor TEXT,
    categoria TEXT DEFAULT 'utilitario', -- utilitario, carro, caminhao, moto
    combustivel TEXT DEFAULT 'flex', -- flex, gasolina, diesel, eletrico
    odometro BIGINT DEFAULT 0,
    situacao TEXT DEFAULT 'ativo', -- ativo, manutencao, vendido, inativo
    proprietario TEXT,
    centro_custo TEXT,
    filial TEXT,
    veiculo_img_url TEXT,
    crlv_url TEXT,
    seguro_url TEXT,
    seguro_vencimento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motoristas
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    cpf TEXT UNIQUE,
    rg TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    cnh_num TEXT,
    cnh_categoria TEXT,
    cnh_validade DATE,
    cnh_url TEXT,
    habilitado BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viagens
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    purpose TEXT,
    km_inicio BIGINT NOT NULL,
    km_fim BIGINT,
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    origem TEXT,
    destino TEXT,
    rota TEXT,
    carga TEXT,
    status TEXT DEFAULT 'agendada', -- agendada, em_andamento, finalizada, cancelada
    comprovante_url TEXT,
    observacoes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklists de Viagem
CREATE TABLE checklists (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    tipo TEXT DEFAULT 'saida', -- saida, retorno
    data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Itens do checklist
    pneus BOOLEAN DEFAULT FALSE,
    niveis BOOLEAN DEFAULT FALSE, -- óleo, água, etc
    luzes BOOLEAN DEFAULT FALSE,
    freios BOOLEAN DEFAULT FALSE,
    extintor BOOLEAN DEFAULT FALSE,
    triangulo BOOLEAN DEFAULT FALSE,
    macaco BOOLEAN DEFAULT FALSE,
    estepe BOOLEAN DEFAULT FALSE,
    documentos BOOLEAN DEFAULT FALSE,
    limpeza BOOLEAN DEFAULT FALSE,
    avarias BOOLEAN DEFAULT FALSE,
    -- Campos adicionais
    km_registrado BIGINT,
    combustivel_nivel TEXT, -- cheio, 3/4, 1/2, 1/4, reserva
    observacoes TEXT,
    fotos_url TEXT[], -- Array de URLs de fotos
    assinatura_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abastecimentos
CREATE TABLE fuelings (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    km BIGINT NOT NULL,
    litros NUMERIC(10,2) NOT NULL,
    valor_litro NUMERIC(10,4),
    valor_total NUMERIC(12,2) NOT NULL,
    tipo_combustivel TEXT DEFAULT 'gasolina', -- gasolina, etanol, diesel, gnv
    posto TEXT,
    cidade TEXT,
    nota_url TEXT,
    observacoes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Manutenções
CREATE TABLE maintenances (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- preventiva, corretiva
    categoria TEXT, -- motor, suspensao, freios, eletrica, funilaria, revisao
    descricao TEXT NOT NULL,
    fornecedor TEXT,
    custo NUMERIC(12,2),
    pecas TEXT[], -- Array de peças trocadas
    data_entrada DATE,
    data_exec DATE,
    proxima_data DATE,
    proxima_km BIGINT,
    status TEXT DEFAULT 'agendada', -- agendada, em_execucao, concluida, cancelada
    prioridade TEXT DEFAULT 'normal', -- baixa, normal, alta, urgente
    anexo_url TEXT,
    nota_url TEXT,
    observacoes TEXT,
    aprovado_por INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ocorrências (Multas e Sinistros)
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- multa, sinistro, avaria, roubo
    subtipo TEXT, -- velocidade, estacionamento, colisao, etc
    descricao TEXT,
    valor NUMERIC(12,2),
    data DATE NOT NULL,
    local TEXT,
    status TEXT DEFAULT 'aberto', -- aberto, em_analise, resolvido, arquivado
    responsavel TEXT, -- empresa, motorista, terceiro
    bo_numero TEXT, -- Boletim de ocorrência
    anexo_url TEXT,
    observacoes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Termos de Aceite
CREATE TABLE acceptances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    driver_id INTEGER REFERENCES drivers(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    termo_tipo TEXT NOT NULL, -- uso_veiculo, politica_frota, responsabilidade
    termo_versao TEXT DEFAULT '1.0',
    termo_conteudo TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    assinatura_url TEXT,
    documento_url TEXT
);

-- Log de Auditoria
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_name TEXT,
    action TEXT NOT NULL, -- create, update, delete, login, logout, export
    entity TEXT NOT NULL, -- vehicles, drivers, trips, etc
    entity_id INTEGER,
    entity_name TEXT,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tipo TEXT NOT NULL, -- alerta, info, warning, success
    titulo TEXT NOT NULL,
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações do Sistema
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_vehicles_placa ON vehicles(placa);
CREATE INDEX idx_vehicles_situacao ON vehicles(situacao);
CREATE INDEX idx_drivers_cpf ON drivers(cpf);
CREATE INDEX idx_drivers_cnh_validade ON drivers(cnh_validade);
CREATE INDEX idx_trips_start_at ON trips(start_at);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_fuelings_vehicle_id ON fuelings(vehicle_id);
CREATE INDEX idx_fuelings_data ON fuelings(data);
CREATE INDEX idx_maintenances_vehicle_id ON maintenances(vehicle_id);
CREATE INDEX idx_maintenances_proxima_data ON maintenances(proxima_data);
CREATE INDEX idx_maintenances_status ON maintenances(status);
CREATE INDEX idx_incidents_vehicle_id ON incidents(vehicle_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenances_updated_at BEFORE UPDATE ON maintenances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
