// Mock data for demo mode (when backend is not available)

export const mockUser = {
  id: '1',
  name: 'Admin Demo',
  email: 'admin@joelini.com',
  role: 'admin',
  avatar_url: null,
};

export const mockVehicles = [
  { id: '1', plate: 'ABC-1234', model: 'Volvo FH 540', brand: 'Volvo', year: 2022, type: 'truck', status: 'active', current_km: 125000, fuel_type: 'diesel' },
  { id: '2', plate: 'DEF-5678', model: 'Scania R450', brand: 'Scania', year: 2021, type: 'truck', status: 'active', current_km: 98000, fuel_type: 'diesel' },
  { id: '3', plate: 'GHI-9012', model: 'Mercedes Actros', brand: 'Mercedes', year: 2023, type: 'truck', status: 'maintenance', current_km: 45000, fuel_type: 'diesel' },
  { id: '4', plate: 'JKL-3456', model: 'Fiat Ducato', brand: 'Fiat', year: 2020, type: 'van', status: 'active', current_km: 78000, fuel_type: 'diesel' },
  { id: '5', plate: 'MNO-7890', model: 'VW Constellation', brand: 'Volkswagen', year: 2022, type: 'truck', status: 'inactive', current_km: 156000, fuel_type: 'diesel' },
];

export const mockDrivers = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-00', cnh: '12345678901', cnh_category: 'E', cnh_expiry: '2025-12-15', phone: '(11) 99999-1111', status: 'active', email: 'joao@joelini.com' },
  { id: '2', name: 'Maria Santos', cpf: '234.567.890-11', cnh: '23456789012', cnh_category: 'D', cnh_expiry: '2024-08-20', phone: '(11) 99999-2222', status: 'active', email: 'maria@joelini.com' },
  { id: '3', name: 'Pedro Oliveira', cpf: '345.678.901-22', cnh: '34567890123', cnh_category: 'E', cnh_expiry: '2025-03-10', phone: '(11) 99999-3333', status: 'active', email: 'pedro@joelini.com' },
  { id: '4', name: 'Ana Costa', cpf: '456.789.012-33', cnh: '45678901234', cnh_category: 'D', cnh_expiry: '2024-11-05', phone: '(11) 99999-4444', status: 'vacation', email: 'ana@joelini.com' },
  { id: '5', name: 'Carlos Souza', cpf: '567.890.123-44', cnh: '56789012345', cnh_category: 'E', cnh_expiry: '2026-01-25', phone: '(11) 99999-5555', status: 'inactive', email: 'carlos@joelini.com' },
];

export const mockTrips = [
  { id: '1', vehicle_id: '1', driver_id: '1', vehicle_plate: 'ABC-1234', driver_name: 'João Silva', origin: 'São Paulo, SP', destination: 'Rio de Janeiro, RJ', start_date: '2024-01-10', end_date: '2024-01-11', start_km: 124500, end_km: 125000, status: 'completed', cargo: 'Eletrônicos' },
  { id: '2', vehicle_id: '2', driver_id: '2', vehicle_plate: 'DEF-5678', driver_name: 'Maria Santos', origin: 'São Paulo, SP', destination: 'Belo Horizonte, MG', start_date: '2024-01-12', end_date: null, start_km: 97500, end_km: null, status: 'in_progress', cargo: 'Alimentos' },
  { id: '3', vehicle_id: '4', driver_id: '3', vehicle_plate: 'JKL-3456', driver_name: 'Pedro Oliveira', origin: 'Campinas, SP', destination: 'Curitiba, PR', start_date: '2024-01-08', end_date: '2024-01-09', start_km: 77000, end_km: 78000, status: 'completed', cargo: 'Medicamentos' },
  { id: '4', vehicle_id: '1', driver_id: '1', vehicle_plate: 'ABC-1234', driver_name: 'João Silva', origin: 'Rio de Janeiro, RJ', destination: 'Vitória, ES', start_date: '2024-01-15', end_date: null, start_km: null, end_km: null, status: 'scheduled', cargo: 'Móveis' },
];

export const mockFuelings = [
  { id: '1', vehicle_id: '1', driver_id: '1', vehicle_plate: 'ABC-1234', driver_name: 'João Silva', date: '2024-01-10', liters: 350, price_per_liter: 5.89, total_cost: 2061.50, km_at_fueling: 124800, fuel_type: 'diesel', station: 'Posto Shell BR-116' },
  { id: '2', vehicle_id: '2', driver_id: '2', vehicle_plate: 'DEF-5678', driver_name: 'Maria Santos', date: '2024-01-11', liters: 280, price_per_liter: 5.79, total_cost: 1621.20, km_at_fueling: 97800, fuel_type: 'diesel', station: 'Posto Ipiranga Centro' },
  { id: '3', vehicle_id: '4', driver_id: '3', vehicle_plate: 'JKL-3456', driver_name: 'Pedro Oliveira', date: '2024-01-09', liters: 80, price_per_liter: 5.99, total_cost: 479.20, km_at_fueling: 77500, fuel_type: 'diesel', station: 'Posto BR Rodovia' },
];

export const mockMaintenances = [
  { id: '1', vehicle_id: '1', vehicle_plate: 'ABC-1234', type: 'preventive', description: 'Troca de óleo e filtros', scheduled_date: '2024-01-20', status: 'scheduled', estimated_cost: 850, provider: 'Oficina Central' },
  { id: '2', vehicle_id: '3', vehicle_plate: 'GHI-9012', type: 'corrective', description: 'Reparo no sistema de freios', scheduled_date: '2024-01-12', start_date: '2024-01-12', status: 'in_progress', estimated_cost: 2500, provider: 'Mercedes Autorizada' },
  { id: '3', vehicle_id: '2', vehicle_plate: 'DEF-5678', type: 'preventive', description: 'Revisão completa 100.000km', scheduled_date: '2024-02-01', status: 'scheduled', estimated_cost: 3200, provider: 'Scania Service' },
  { id: '4', vehicle_id: '5', vehicle_plate: 'MNO-7890', type: 'corrective', description: 'Substituição de embreagem', scheduled_date: '2024-01-05', start_date: '2024-01-05', end_date: '2024-01-08', status: 'completed', estimated_cost: 4500, actual_cost: 4200, provider: 'VW Trucks' },
];

export const mockIncidents = [
  { id: '1', vehicle_id: '1', driver_id: '1', vehicle_plate: 'ABC-1234', driver_name: 'João Silva', type: 'accident', date: '2024-01-05', location: 'BR-116 KM 450', description: 'Colisão leve com outro veículo', severity: 'low', status: 'resolved', resolution: 'Danos mínimos, seguro acionado' },
  { id: '2', vehicle_id: '3', driver_id: '3', vehicle_plate: 'GHI-9012', driver_name: 'Pedro Oliveira', type: 'breakdown', date: '2024-01-10', location: 'SP-330 KM 120', description: 'Falha no sistema de freios', severity: 'high', status: 'open' },
  { id: '3', vehicle_id: '4', driver_id: '2', vehicle_plate: 'JKL-3456', driver_name: 'Maria Santos', type: 'fine', date: '2024-01-08', location: 'Av. Paulista, São Paulo', description: 'Multa por estacionamento irregular', severity: 'low', status: 'resolved', resolution: 'Multa paga' },
];

export const mockAuditLogs = [
  { id: '1', user_id: '1', user_name: 'Admin Demo', action: 'login', entity_type: 'auth', created_at: '2024-01-12T10:30:00Z' },
  { id: '2', user_id: '1', user_name: 'Admin Demo', action: 'create', entity_type: 'trip', entity_id: '4', created_at: '2024-01-12T10:35:00Z' },
  { id: '3', user_id: '1', user_name: 'Admin Demo', action: 'update', entity_type: 'vehicle', entity_id: '3', created_at: '2024-01-12T09:00:00Z' },
  { id: '4', user_id: '1', user_name: 'Admin Demo', action: 'create', entity_type: 'fueling', entity_id: '3', created_at: '2024-01-11T16:20:00Z' },
];

export const mockDashboardStats = {
  totalVehicles: 5,
  activeVehicles: 3,
  inMaintenance: 1,
  totalDrivers: 5,
  activeDrivers: 3,
  tripsThisMonth: 4,
  fuelCostThisMonth: 4161.90,
  pendingMaintenances: 2,
};
