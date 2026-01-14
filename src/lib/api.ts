import { 
  mockUser, 
  mockVehicles, 
  mockDrivers, 
  mockTrips, 
  mockFuelings, 
  mockMaintenances, 
  mockIncidents, 
  mockAuditLogs,
  mockDashboardStats 
} from './mockData';

// Detecta se está rodando no ambiente Lovable (preview)
const isLovablePreview = window.location.hostname.includes('lovable.app') || 
                          window.location.hostname.includes('lovableproject.com');

// Para modo demo, usamos dados mock
const DEMO_MODE = isLovablePreview || import.meta.env.VITE_DEMO_MODE === 'true';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    // Em modo demo, auto-login
    if (DEMO_MODE && !this.token) {
      this.token = 'demo-token';
      localStorage.setItem('token', 'demo-token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Em modo demo, retorna dados mock
    if (DEMO_MODE) {
      return this.handleDemoRequest<T>(endpoint, options);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
  }

  private async handleDemoRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));

    const method = options.method || 'GET';
    
    // Auth endpoints
    if (endpoint === '/auth/login') {
      return { token: 'demo-token', user: mockUser } as T;
    }
    if (endpoint === '/auth/me') {
      return mockUser as T;
    }
    if (endpoint === '/auth/logout') {
      return {} as T;
    }

    // Vehicles
    if (endpoint.startsWith('/vehicles')) {
      if (endpoint === '/vehicles/stats/summary') {
        return { 
          total: mockVehicles.length,
          active: mockVehicles.filter(v => v.status === 'active').length,
          maintenance: mockVehicles.filter(v => v.status === 'maintenance').length,
          inactive: mockVehicles.filter(v => v.status === 'inactive').length,
        } as T;
      }
      if (method === 'GET' && !endpoint.includes('/vehicles/')) {
        return { data: mockVehicles, pagination: { total: mockVehicles.length, page: 1, limit: 10 } } as T;
      }
      const id = endpoint.split('/')[2];
      if (id) {
        return mockVehicles.find(v => v.id === id) as T;
      }
    }

    // Drivers
    if (endpoint.startsWith('/drivers')) {
      if (endpoint === '/drivers/available/list') {
        return mockDrivers.filter(d => d.status === 'active') as T;
      }
      if (method === 'GET' && !endpoint.match(/\/drivers\/\d/)) {
        return { data: mockDrivers, pagination: { total: mockDrivers.length, page: 1, limit: 10 } } as T;
      }
      const id = endpoint.split('/')[2];
      if (id) {
        return mockDrivers.find(d => d.id === id) as T;
      }
    }

    // Trips
    if (endpoint.startsWith('/trips')) {
      if (method === 'GET' && !endpoint.match(/\/trips\/\d/)) {
        return { data: mockTrips, pagination: { total: mockTrips.length, page: 1, limit: 10 } } as T;
      }
      const id = endpoint.split('/')[2];
      if (id) {
        return mockTrips.find(t => t.id === id) as T;
      }
    }

    // Fuelings
    if (endpoint.startsWith('/fuelings')) {
      if (endpoint === '/fuelings/stats/summary' || endpoint.includes('/stats/summary')) {
        return { 
          totalCost: mockFuelings.reduce((sum, f) => sum + f.total_cost, 0),
          totalLiters: mockFuelings.reduce((sum, f) => sum + f.liters, 0),
          avgPricePerLiter: 5.89,
          count: mockFuelings.length,
        } as T;
      }
      if (method === 'GET' && !endpoint.match(/\/fuelings\/\d/)) {
        return { data: mockFuelings, pagination: { total: mockFuelings.length, page: 1, limit: 10 } } as T;
      }
    }

    // Maintenances
    if (endpoint.startsWith('/maintenances')) {
      if (endpoint === '/maintenances/upcoming/list') {
        return mockMaintenances.filter(m => m.status === 'scheduled') as T;
      }
      if (method === 'GET' && !endpoint.match(/\/maintenances\/\d/)) {
        return { data: mockMaintenances, pagination: { total: mockMaintenances.length, page: 1, limit: 10 } } as T;
      }
    }

    // Incidents
    if (endpoint.startsWith('/incidents')) {
      if (method === 'GET' && !endpoint.match(/\/incidents\/\d/)) {
        return { data: mockIncidents, pagination: { total: mockIncidents.length, page: 1, limit: 10 } } as T;
      }
    }

    // Users
    if (endpoint.startsWith('/users')) {
      if (endpoint === '/users/roles/list') {
        return [
          { id: 'admin', name: 'Administrador' },
          { id: 'manager', name: 'Gerente' },
          { id: 'operator', name: 'Operador' },
        ] as T;
      }
      return [mockUser] as T;
    }

    // Settings
    if (endpoint.startsWith('/settings')) {
      return {
        company_name: { value: 'Joelini Transportes', description: 'Nome da empresa' },
        notification_email: { value: 'contato@joelini.com', description: 'E-mail para notificações' },
      } as T;
    }

    // Audit
    if (endpoint.startsWith('/audit')) {
      if (endpoint === '/audit/stats/summary') {
        return { totalActions: mockAuditLogs.length, todayActions: 2 } as T;
      }
      return { data: mockAuditLogs, pagination: { total: mockAuditLogs.length, page: 1, limit: 10 } } as T;
    }

    // Dashboard stats
    if (endpoint === '/dashboard/stats') {
      return mockDashboardStats as T;
    }

    return {} as T;
  }

  // Auth
  async login(email: string, password: string) {
    if (DEMO_MODE) {
      // Em modo demo, aceita qualquer credencial
      this.setToken('demo-token');
      return { token: 'demo-token', user: mockUser };
    }
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      if (!DEMO_MODE) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Vehicles
  async getVehicles(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/vehicles${query}`);
  }

  async getVehicle(id: string) {
    return this.request<any>(`/vehicles/${id}`);
  }

  async createVehicle(data: any) {
    return this.request<any>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(id: string, data: any) {
    return this.request<any>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(id: string) {
    return this.request(`/vehicles/${id}`, { method: 'DELETE' });
  }

  async getVehicleStats() {
    return this.request<any>('/vehicles/stats/summary');
  }

  // Drivers
  async getDrivers(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/drivers${query}`);
  }

  async getDriver(id: string) {
    return this.request<any>(`/drivers/${id}`);
  }

  async createDriver(data: any) {
    return this.request<any>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDriver(id: string, data: any) {
    return this.request<any>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDriver(id: string) {
    return this.request(`/drivers/${id}`, { method: 'DELETE' });
  }

  async getAvailableDrivers() {
    return this.request<any[]>('/drivers/available/list');
  }

  // Trips
  async getTrips(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/trips${query}`);
  }

  async getTrip(id: string) {
    return this.request<any>(`/trips/${id}`);
  }

  async createTrip(data: any) {
    return this.request<any>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finishTrip(id: string, data: any) {
    return this.request<any>(`/trips/${id}/finish`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelTrip(id: string, reason?: string) {
    return this.request<any>(`/trips/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Fuelings
  async getFuelings(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/fuelings${query}`);
  }

  async getFueling(id: string) {
    return this.request<any>(`/fuelings/${id}`);
  }

  async createFueling(data: any) {
    return this.request<any>('/fuelings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFueling(id: string, data: any) {
    return this.request<any>(`/fuelings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFueling(id: string) {
    return this.request(`/fuelings/${id}`, { method: 'DELETE' });
  }

  async getFuelingStats(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/fuelings/stats/summary${query}`);
  }

  // Maintenances
  async getMaintenances(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/maintenances${query}`);
  }

  async getMaintenance(id: string) {
    return this.request<any>(`/maintenances/${id}`);
  }

  async createMaintenance(data: any) {
    return this.request<any>('/maintenances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenance(id: string, data: any) {
    return this.request<any>(`/maintenances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async startMaintenance(id: string) {
    return this.request<any>(`/maintenances/${id}/start`, { method: 'PUT' });
  }

  async finishMaintenance(id: string, data: any) {
    return this.request<any>(`/maintenances/${id}/finish`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMaintenance(id: string) {
    return this.request(`/maintenances/${id}`, { method: 'DELETE' });
  }

  async getUpcomingMaintenances() {
    return this.request<any[]>('/maintenances/upcoming/list');
  }

  // Incidents
  async getIncidents(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/incidents${query}`);
  }

  async getIncident(id: string) {
    return this.request<any>(`/incidents/${id}`);
  }

  async createIncident(data: any) {
    return this.request<any>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIncident(id: string, data: any) {
    return this.request<any>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async resolveIncident(id: string, data: any) {
    return this.request<any>(`/incidents/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIncident(id: string) {
    return this.request(`/incidents/${id}`, { method: 'DELETE' });
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  async getRoles() {
    return this.request<any[]>('/users/roles/list');
  }

  // Settings
  async getSettings() {
    return this.request<Record<string, { value: string; description: string }>>('/settings');
  }

  async updateSettings(data: Record<string, string>) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Audit
  async getAuditLogs(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: any[]; pagination: any }>(`/audit${query}`);
  }

  async getAuditStats() {
    return this.request<any>('/audit/stats/summary');
  }

  // Upload
  async uploadFile(category: string, file: File) {
    if (DEMO_MODE) {
      // Em modo demo, simula upload
      return { url: URL.createObjectURL(file), filename: file.name };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/${category}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro no upload' }));
      throw new Error(error.error);
    }

    return response.json();
  }

  async deleteFile(category: string, filename: string) {
    return this.request(`/upload/${category}/${filename}`, { method: 'DELETE' });
  }

  // Helper para verificar se está em modo demo
  isDemoMode() {
    return DEMO_MODE;
  }
}

export const api = new ApiService();
export default api;
