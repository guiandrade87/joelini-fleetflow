import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecentTripsTable } from "@/components/dashboard/RecentTripsTable";
import { MaintenanceSchedule } from "@/components/dashboard/MaintenanceSchedule";
import { Car, Route, Fuel, DollarSign, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const checklistItems = [
  { id: "niveis", label: "Níveis (óleo, água, combustível)" },
  { id: "pneus", label: "Pneus (calibragem e estado)" },
  { id: "luzes", label: "Luzes (faróis, lanternas, setas)" },
  { id: "freios", label: "Freios" },
  { id: "limpador", label: "Limpador de para-brisa" },
  { id: "macaco", label: "Macaco e chave de roda" },
  { id: "extintor", label: "Extintor de incêndio" },
  { id: "triangulo", label: "Triângulo de sinalização" },
  { id: "documentos", label: "Documentos do veículo" },
  { id: "estepe", label: "Estepe" },
];

interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalTrips: number;
  activeTrips: number;
  totalKm: number;
  totalCost: number;
}

interface Alert {
  id: string;
  type: "danger" | "warning" | "info";
  title: string;
  description: string;
  date: string;
}

interface Trip {
  id: string;
  vehicle: string;
  plate: string;
  driver: string;
  origin: string;
  destination: string;
  date: string;
  km: number;
  status: "em_andamento" | "finalizada" | "agendada";
}

interface Maintenance {
  id: string;
  vehicle: string;
  plate: string;
  type: string;
  scheduledDate: string;
  daysUntil: number;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  current_km: number;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalTrips: 0,
    activeTrips: 0,
    totalKm: 0,
    totalCost: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Dialog states
  const [isFuelingOpen, setIsFuelingOpen] = useState(false);
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Form states
  const [fuelingForm, setFuelingForm] = useState({
    vehicleId: "",
    driverId: "",
    date: "",
    currentKm: "",
    liters: "",
    pricePerLiter: "",
    fuelType: "",
    station: "",
  });

  const [tripForm, setTripForm] = useState({
    vehicleId: "",
    driverId: "",
    origin: "",
    destination: "",
    startAt: "",
    kmInicio: "",
    purpose: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [vehicleStats, tripsRes, maintenancesRes, fuelingsStats, vehiclesRes, driversRes] = await Promise.all([
        api.getVehicleStats(),
        api.getTrips({ limit: 5 }),
        api.getUpcomingMaintenances(),
        api.getFuelingStats(),
        api.getVehicles({ limit: 100 }),
        api.getDrivers({ limit: 100 }),
      ]);

      // Set stats
      setStats({
        totalVehicles: vehicleStats.total || 0,
        activeVehicles: vehicleStats.active || 0,
        totalTrips: tripsRes.pagination?.total || 0,
        activeTrips: tripsRes.data?.filter((t: any) => t.status === "em_andamento").length || 0,
        totalKm: fuelingsStats.totalKm || 0,
        totalCost: (fuelingsStats.totalCost || 0) + (fuelingsStats.maintenanceCost || 0),
      });

      // Set vehicles and drivers
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);

      // Transform trips for display
      const formattedTrips = (tripsRes.data || []).slice(0, 4).map((t: any) => ({
        id: t.id,
        vehicle: t.vehicle_model || "Veículo",
        plate: t.vehicle_plate || "",
        driver: t.driver_name || "Motorista",
        origin: t.origin,
        destination: t.destination,
        date: new Date(t.start_date).toLocaleDateString("pt-BR"),
        km: t.end_km ? t.end_km - t.start_km : 0,
        status: t.status,
      }));
      setRecentTrips(formattedTrips);

      // Transform maintenances for display
      const formattedMaintenances = (maintenancesRes || []).slice(0, 4).map((m: any) => {
        const scheduledDate = new Date(m.scheduled_date);
        const today = new Date();
        const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: m.id,
          vehicle: m.vehicle_model || "Veículo",
          plate: m.vehicle_plate || "",
          type: m.description,
          scheduledDate: scheduledDate.toLocaleDateString("pt-BR"),
          daysUntil,
        };
      });
      setUpcomingMaintenances(formattedMaintenances);

      // Generate alerts from data
      const generatedAlerts: Alert[] = [];
      
      // Check for overdue maintenances
      formattedMaintenances.forEach((m: any) => {
        if (m.daysUntil < 0) {
          generatedAlerts.push({
            id: `maint-${m.id}`,
            type: "danger",
            title: "Manutenção Atrasada",
            description: `${m.vehicle} ${m.plate} - ${m.type}`,
            date: `${Math.abs(m.daysUntil)} dias`,
          });
        } else if (m.daysUntil <= 7) {
          generatedAlerts.push({
            id: `maint-${m.id}`,
            type: "warning",
            title: "Manutenção Próxima",
            description: `${m.vehicle} ${m.plate} - ${m.type}`,
            date: `Em ${m.daysUntil} dias`,
          });
        }
      });

      setAlerts(generatedAlerts.slice(0, 3));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setCheckedItems([...checkedItems, itemId]);
    } else {
      setCheckedItems(checkedItems.filter((id) => id !== itemId));
    }
  };

  const handleRegisterFueling = async () => {
    if (!fuelingForm.vehicleId || !fuelingForm.driverId || !fuelingForm.liters || !fuelingForm.pricePerLiter) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await api.createFueling({
        vehicle_id: fuelingForm.vehicleId,
        driver_id: fuelingForm.driverId,
        date: fuelingForm.date || new Date().toISOString().split('T')[0],
        current_km: fuelingForm.currentKm ? parseInt(fuelingForm.currentKm) : undefined,
        liters: parseFloat(fuelingForm.liters),
        price_per_liter: parseFloat(fuelingForm.pricePerLiter),
        total_cost: parseFloat(fuelingForm.liters) * parseFloat(fuelingForm.pricePerLiter),
        fuel_type: fuelingForm.fuelType || "gasolina",
        station: fuelingForm.station,
      });

      setIsFuelingOpen(false);
      setFuelingForm({
        vehicleId: "",
        driverId: "",
        date: "",
        currentKm: "",
        liters: "",
        pricePerLiter: "",
        fuelType: "",
        station: "",
      });
      toast({
        title: "Abastecimento registrado",
        description: "O abastecimento foi registrado com sucesso.",
      });
      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar abastecimento.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartTrip = async () => {
    if (checkedItems.length < checklistItems.length) {
      toast({
        title: "Checklist incompleto",
        description: "Você precisa verificar todos os itens do checklist antes de iniciar a viagem.",
        variant: "destructive",
      });
      return;
    }

    if (!tripForm.vehicleId || !tripForm.driverId || !tripForm.origin || !tripForm.destination) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const vehicle = vehicles.find(v => v.id === tripForm.vehicleId);
      
      await api.createTrip({
        vehicle_id: tripForm.vehicleId,
        driver_id: tripForm.driverId,
        origin: tripForm.origin,
        destination: tripForm.destination,
        start_date: new Date().toISOString(),
        start_km: tripForm.kmInicio ? parseInt(tripForm.kmInicio) : vehicle?.current_km,
        purpose: tripForm.purpose,
        trip_type: "curta",
        status: "em_andamento",
      });

      setIsTripOpen(false);
      setCheckedItems([]);
      setActiveTab("dados");
      setTripForm({
        vehicleId: "",
        driverId: "",
        origin: "",
        destination: "",
        startAt: "",
        kmInicio: "",
        purpose: "",
      });
      toast({
        title: "Viagem iniciada",
        description: "A viagem foi registrada e iniciada com sucesso.",
      });
      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar viagem.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleTrip = async () => {
    if (!tripForm.vehicleId || !tripForm.driverId || !tripForm.origin || !tripForm.destination || !tripForm.startAt) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios, incluindo data/hora de saída.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const vehicle = vehicles.find(v => v.id === tripForm.vehicleId);
      
      await api.createTrip({
        vehicle_id: tripForm.vehicleId,
        driver_id: tripForm.driverId,
        origin: tripForm.origin,
        destination: tripForm.destination,
        start_date: tripForm.startAt,
        start_km: tripForm.kmInicio ? parseInt(tripForm.kmInicio) : vehicle?.current_km,
        purpose: tripForm.purpose,
        trip_type: "curta",
        status: "agendada",
      });

      setIsTripOpen(false);
      setCheckedItems([]);
      setActiveTab("dados");
      setTripForm({
        vehicleId: "",
        driverId: "",
        origin: "",
        destination: "",
        startAt: "",
        kmInicio: "",
        purpose: "",
      });
      toast({
        title: "Viagem agendada",
        description: "A viagem foi agendada com sucesso.",
      });
      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao agendar viagem.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Available vehicles and drivers
  const availableVehicles = vehicles.filter(v => v.status === "disponivel" || v.status === "active");
  const availableDrivers = drivers.filter(d => d.status === "ativo" || d.status === "active");

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Bem-vindo de volta!
            </h2>
            <p className="text-muted-foreground">
              Visão geral da frota em {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsFuelingOpen(true)}>
              <Fuel className="h-4 w-4 mr-2" />
              Registrar Abastecimento
            </Button>
            <Button className="btn-primary-glow" onClick={() => setIsTripOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Viagem
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Veículos Ativos"
            value={String(stats.activeVehicles)}
            subtitle={`de ${stats.totalVehicles} veículos`}
            icon={<Car className="h-6 w-6" />}
          />
          <StatCard
            title="Viagens no Mês"
            value={String(stats.totalTrips)}
            subtitle={`${stats.activeTrips} em andamento`}
            icon={<Route className="h-6 w-6" />}
          />
          <StatCard
            title="KM Total"
            value={stats.totalKm.toLocaleString("pt-BR")}
            subtitle="km rodados no mês"
            icon={<Fuel className="h-6 w-6" />}
          />
          <StatCard
            title="Custo Mensal"
            value={`R$ ${stats.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            subtitle="combustível + manutenção"
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>

        {/* Alerts and Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertCard alerts={alerts} />
          <MaintenanceSchedule maintenances={upcomingMaintenances} />
        </div>

        {/* Recent Trips */}
        <RecentTripsTable trips={recentTrips} />
      </div>

      {/* Dialog Registrar Abastecimento */}
      <Dialog open={isFuelingOpen} onOpenChange={setIsFuelingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Abastecimento</DialogTitle>
            <DialogDescription>
              Preencha os dados do abastecimento realizado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veículo *</Label>
                <Select 
                  value={fuelingForm.vehicleId}
                  onValueChange={(v) => {
                    const vehicle = vehicles.find(veh => veh.id === v);
                    setFuelingForm({ 
                      ...fuelingForm, 
                      vehicleId: v,
                      currentKm: String(vehicle?.current_km || "")
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.brand} {v.model} - {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motorista *</Label>
                <Select 
                  value={fuelingForm.driverId}
                  onValueChange={(v) => setFuelingForm({ ...fuelingForm, driverId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input 
                  type="date"
                  value={fuelingForm.date}
                  onChange={(e) => setFuelingForm({ ...fuelingForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Odômetro (km)</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={fuelingForm.currentKm}
                  onChange={(e) => setFuelingForm({ ...fuelingForm, currentKm: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Litros *</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={fuelingForm.liters}
                  onChange={(e) => setFuelingForm({ ...fuelingForm, liters: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço/Litro *</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={fuelingForm.pricePerLiter}
                  onChange={(e) => setFuelingForm({ ...fuelingForm, pricePerLiter: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Combustível</Label>
                <Select 
                  value={fuelingForm.fuelType}
                  onValueChange={(v) => setFuelingForm({ ...fuelingForm, fuelType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="etanol">Etanol</SelectItem>
                    <SelectItem value="diesel">Diesel S10</SelectItem>
                    <SelectItem value="gnv">GNV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posto</Label>
              <Input 
                placeholder="Nome do posto"
                value={fuelingForm.station}
                onChange={(e) => setFuelingForm({ ...fuelingForm, station: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFuelingOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterFueling} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Viagem */}
      <Dialog open={isTripOpen} onOpenChange={setIsTripOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nova Viagem</DialogTitle>
            <DialogDescription>
              Preencha os dados da viagem. O checklist é obrigatório antes de iniciar.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados da Viagem</TabsTrigger>
              <TabsTrigger value="checklist">
                Checklist ({checkedItems.length}/{checklistItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Veículo *</Label>
                  <Select 
                    value={tripForm.vehicleId}
                    onValueChange={(v) => {
                      const vehicle = vehicles.find(veh => veh.id === v);
                      setTripForm({ 
                        ...tripForm, 
                        vehicleId: v,
                        kmInicio: String(vehicle?.current_km || "")
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.brand} {v.model} - {v.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Motorista *</Label>
                  <Select 
                    value={tripForm.driverId}
                    onValueChange={(v) => setTripForm({ ...tripForm, driverId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origem *</Label>
                  <Input 
                    placeholder="Cidade, UF"
                    value={tripForm.origin}
                    onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destino *</Label>
                  <Input 
                    placeholder="Cidade, UF"
                    value={tripForm.destination}
                    onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data/Hora Saída</Label>
                  <Input 
                    type="datetime-local"
                    value={tripForm.startAt}
                    onChange={(e) => setTripForm({ ...tripForm, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KM Inicial</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={tripForm.kmInicio}
                    onChange={(e) => setTripForm({ ...tripForm, kmInicio: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Finalidade da Viagem</Label>
                <Textarea 
                  placeholder="Descreva o motivo da viagem..."
                  rows={3}
                  value={tripForm.purpose}
                  onChange={(e) => setTripForm({ ...tripForm, purpose: e.target.value })}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="checklist" className="space-y-4 pt-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground mb-4">
                  Verifique todos os itens antes de iniciar a viagem. Todos os itens marcados serão registrados como verificados.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={checkedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                      />
                      <Label 
                        htmlFor={item.id} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsTripOpen(false);
                setCheckedItems([]);
                setActiveTab("dados");
              }}
            >
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleScheduleTrip} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar como Agendada
            </Button>
            <Button onClick={handleStartTrip} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Iniciar Viagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
