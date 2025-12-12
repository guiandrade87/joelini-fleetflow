-- Seed Data - Sistema de Gestão de Frota Joelini

-- Roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador do sistema com acesso total'),
('gestor_frota', 'Gestor de frota com acesso a relatórios e aprovações'),
('operacional', 'Operacional com acesso a cadastros e registros'),
('motorista', 'Motorista com acesso limitado às suas viagens');

-- Usuários (senha: joelini123 - hash bcrypt)
INSERT INTO users (name, email, password_hash, role_id, phone, active) VALUES
('Administrador', 'admin@joelini.com.br', '$2b$10$rQZ8K1QK1QK1QK1QK1QK1uQK1QK1QK1QK1QK1QK1QK1QK1QK1QK1Q', 1, '(11) 99999-0001', true),
('Carlos Silva', 'carlos.silva@joelini.com.br', '$2b$10$rQZ8K1QK1QK1QK1QK1QK1uQK1QK1QK1QK1QK1QK1QK1QK1QK1QK1Q', 2, '(11) 99999-0002', true),
('Maria Santos', 'maria.santos@joelini.com.br', '$2b$10$rQZ8K1QK1QK1QK1QK1QK1uQK1QK1QK1QK1QK1QK1QK1QK1QK1QK1Q', 3, '(11) 99999-0003', true),
('João Oliveira', 'joao.oliveira@joelini.com.br', '$2b$10$rQZ8K1QK1QK1QK1QK1QK1uQK1QK1QK1QK1QK1QK1QK1QK1QK1QK1Q', 4, '(11) 99999-0004', true),
('Ana Costa', 'ana.costa@joelini.com.br', '$2b$10$rQZ8K1QK1QK1QK1QK1QK1uQK1QK1QK1QK1QK1QK1QK1QK1QK1QK1Q', 4, '(11) 99999-0005', true);

-- Veículos
INSERT INTO vehicles (placa, renavam, chassi, modelo, marca, ano, cor, categoria, combustivel, odometro, situacao, centro_custo, filial) VALUES
('ABC-1234', '12345678901', '9BWHE21JX24060831', 'Strada Freedom', 'Fiat', 2023, 'Branco', 'utilitario', 'flex', 45230, 'ativo', 'Logística', 'São Paulo'),
('DEF-5678', '23456789012', '9BWHE21JX24060832', 'Toro Endurance', 'Fiat', 2022, 'Prata', 'utilitario', 'diesel', 67890, 'ativo', 'Comercial', 'São Paulo'),
('GHI-9012', '34567890123', '9BWHE21JX24060833', 'Onix Plus', 'Chevrolet', 2023, 'Preto', 'carro', 'flex', 23450, 'ativo', 'Administrativo', 'Campinas'),
('JKL-3456', '45678901234', '9BWHE21JX24060834', 'HR', 'Hyundai', 2021, 'Branco', 'caminhao', 'diesel', 128900, 'manutencao', 'Logística', 'São Paulo'),
('MNO-7890', '56789012345', '9BWHE21JX24060835', 'Sprinter', 'Mercedes', 2022, 'Branco', 'utilitario', 'diesel', 89450, 'ativo', 'Logística', 'Ribeirão Preto');

-- Motoristas
INSERT INTO drivers (name, cpf, rg, telefone, email, cnh_num, cnh_categoria, cnh_validade, habilitado) VALUES
('José Pereira', '123.456.789-00', '12.345.678-9', '(11) 98765-4321', 'jose.pereira@joelini.com.br', '12345678900', 'D', '2025-06-15', true),
('Marcos Souza', '234.567.890-11', '23.456.789-0', '(11) 98765-4322', 'marcos.souza@joelini.com.br', '23456789011', 'C', '2024-03-20', true),
('Pedro Lima', '345.678.901-22', '34.567.890-1', '(11) 98765-4323', 'pedro.lima@joelini.com.br', '34567890122', 'B', '2025-12-10', true),
('Ricardo Alves', '456.789.012-33', '45.678.901-2', '(11) 98765-4324', 'ricardo.alves@joelini.com.br', '45678901233', 'D', '2024-01-05', false),
('Fernando Costa', '567.890.123-44', '56.789.012-3', '(11) 98765-4325', 'fernando.costa@joelini.com.br', '56789012344', 'E', '2026-08-30', true);

-- Viagens (últimos 30 dias)
INSERT INTO trips (vehicle_id, driver_id, purpose, km_inicio, km_fim, start_at, end_at, origem, destino, status, created_by) VALUES
(1, 1, 'Entrega para cliente em Campinas', 45000, 45180, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '4 hours', 'São Paulo - SP', 'Campinas - SP', 'finalizada', 3),
(2, 2, 'Visita comercial', 67500, 67750, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '6 hours', 'São Paulo - SP', 'Santos - SP', 'finalizada', 3),
(3, 3, 'Reunião diretoria', 23200, 23350, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '3 hours', 'Campinas - SP', 'São Paulo - SP', 'finalizada', 3),
(1, 1, 'Coleta de materiais', 45180, 45230, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '2 hours', 'São Paulo - SP', 'Guarulhos - SP', 'finalizada', 3),
(5, 5, 'Entrega Ribeirão', 89200, 89450, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '5 hours', 'São Paulo - SP', 'Ribeirão Preto - SP', 'finalizada', 3),
(2, 2, 'Entrega urgente', 67750, NULL, NOW() - INTERVAL '1 hour', NULL, 'São Paulo - SP', 'Jundiaí - SP', 'em_andamento', 3),
(3, 3, 'Visita técnica', 23450, NULL, NOW() + INTERVAL '2 days', NULL, 'Campinas - SP', 'Sorocaba - SP', 'agendada', 3);

-- Abastecimentos
INSERT INTO fuelings (vehicle_id, driver_id, data, km, litros, valor_litro, valor_total, tipo_combustivel, posto, cidade, created_by) VALUES
(1, 1, NOW() - INTERVAL '20 days', 45050, 45.5, 5.89, 268.00, 'gasolina', 'Posto Shell Centro', 'São Paulo', 3),
(2, 2, NOW() - INTERVAL '18 days', 67600, 65.0, 6.15, 399.75, 'diesel', 'Posto Ipiranga', 'São Paulo', 3),
(3, 3, NOW() - INTERVAL '12 days', 23280, 35.0, 5.79, 202.65, 'gasolina', 'Posto BR', 'Campinas', 3),
(1, 1, NOW() - INTERVAL '8 days', 45200, 42.0, 5.95, 249.90, 'gasolina', 'Posto Shell Centro', 'São Paulo', 3),
(5, 5, NOW() - INTERVAL '3 days', 89350, 70.0, 6.20, 434.00, 'diesel', 'Posto Petrobras', 'Ribeirão Preto', 3),
(2, 2, NOW() - INTERVAL '1 day', 67780, 55.0, 6.18, 339.90, 'diesel', 'Posto Ipiranga', 'São Paulo', 3);

-- Manutenções
INSERT INTO maintenances (vehicle_id, tipo, categoria, descricao, fornecedor, custo, data_entrada, data_exec, proxima_data, status, prioridade, created_by) VALUES
(1, 'preventiva', 'revisao', 'Revisão 45.000 km - troca de óleo e filtros', 'Concessionária Fiat', 850.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days', NOW() + INTERVAL '90 days', 'concluida', 'normal', 2),
(2, 'corretiva', 'freios', 'Substituição de pastilhas e discos dianteiros', 'Auto Center Premium', 1200.00, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NULL, 'concluida', 'alta', 2),
(4, 'corretiva', 'motor', 'Vazamento no sistema de arrefecimento', 'Oficina Especializada', 2500.00, NOW() - INTERVAL '5 days', NULL, NULL, 'em_execucao', 'urgente', 2),
(3, 'preventiva', 'revisao', 'Revisão 25.000 km', 'Concessionária Chevrolet', NULL, NULL, NULL, NOW() + INTERVAL '15 days', 'agendada', 'normal', 2),
(5, 'preventiva', 'eletrica', 'Verificação sistema elétrico', 'Auto Elétrica Central', NULL, NULL, NULL, NOW() + INTERVAL '7 days', 'agendada', 'baixa', 2);

-- Ocorrências
INSERT INTO incidents (vehicle_id, driver_id, tipo, subtipo, descricao, valor, data, local, status, responsavel, created_by) VALUES
(2, 2, 'multa', 'velocidade', 'Excesso de velocidade - radar Marginal Tietê', 293.47, NOW() - INTERVAL '45 days', 'São Paulo - SP', 'resolvido', 'motorista', 3),
(1, 1, 'multa', 'estacionamento', 'Estacionamento em local proibido', 195.23, NOW() - INTERVAL '20 days', 'Campinas - SP', 'aberto', 'empresa', 3),
(3, 3, 'sinistro', 'colisao', 'Colisão traseira leve em semáforo', 1500.00, NOW() - INTERVAL '60 days', 'São Paulo - SP', 'resolvido', 'terceiro', 3);

-- Termos de Aceite
INSERT INTO acceptances (user_id, driver_id, vehicle_id, termo_tipo, termo_versao, accepted_at, ip_address) VALUES
(4, 1, 1, 'uso_veiculo', '1.0', NOW() - INTERVAL '90 days', '192.168.1.100'),
(4, 1, 2, 'uso_veiculo', '1.0', NOW() - INTERVAL '90 days', '192.168.1.100'),
(5, 2, 2, 'uso_veiculo', '1.0', NOW() - INTERVAL '85 days', '192.168.1.101'),
(4, 1, NULL, 'politica_frota', '2.0', NOW() - INTERVAL '30 days', '192.168.1.100');

-- Configurações do Sistema
INSERT INTO settings (key, value, description) VALUES
('km_preventiva', '10000', 'Intervalo de km para manutenção preventiva'),
('dias_alerta_cnh', '30', 'Dias de antecedência para alerta de CNH vencendo'),
('dias_alerta_manutencao', '7', 'Dias de antecedência para alerta de manutenção'),
('custo_km_medio', '0.85', 'Custo médio por km rodado'),
('empresa_nome', 'Joelini', 'Nome da empresa'),
('empresa_cnpj', '00.000.000/0001-00', 'CNPJ da empresa');

-- Logs de Auditoria iniciais
INSERT INTO audit_logs (user_id, user_name, action, entity, entity_name, created_at) VALUES
(1, 'Administrador', 'create', 'system', 'Sistema inicializado', NOW());
