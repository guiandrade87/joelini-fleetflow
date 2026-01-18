import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Route,
  MapPin,
  Clock,
  CheckCircle2,
  Play,
  Eye,
  BookOpen,
  Ban,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

interface Trip {
  id: string;
  vehicle_id: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  driver_id: string;
  driver_name?: string;
  origin: string;
  destination: string;
  purpose?: string;
  start_km: number;
  end_km?: number;
  start_date: string;
  end_date?: string;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  trip_type: "curta" | "longa";
  notes?: string;
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

interface ChecklistItem {
  id: string;
  label: string;
}

const checklistItems: ChecklistItem[] = [
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

const getStatusBadge = (status: Trip["status"]) => {
  switch (status) {
    case "em_andamento":
      return (
        <Badge className="bg-primary/10 text-primary border-0">
          <Play className="h-3 w-3 mr-1" />
          Em andamento
        </Badge>
      );
    case "concluida":
      return (
        <Badge className="bg-success/10 text-success border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Finalizada
        </Badge>
      );
    case "agendada":
      return (
        <Badge className="bg-muted text-muted-foreground border-0">
          <Clock className="h-3 w-3 mr-1" />
          Agendada
        </Badge>
      );
    case "cancelada":
      return (
        <Badge className="bg-destructive/10 text-destructive border-0">
          <Ban className="h-3 w-3 mr-1" />
          Cancelada
        </Badge>
      );
  }
};

const getTripTypeBadge = (tripType: Trip["trip_type"]) => {
  if (tripType === "longa") {
    return (
      <Badge variant="outline" className="text-xs">
        <BookOpen className="h-3 w-3 mr-1" />
        Longa
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs bg-muted/50">
      Curta
    </Badge>
  );
};

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Dialog states
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState("dados");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state for new trip
  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    origin: "",
    destination: "",
    startAt: "",
    kmInicio: "",
    purpose: "",
    tripType: "curta" as "curta" | "longa",
  });

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [checklistObs, setChecklistObs] = useState("");

  // Finish trip form
  const [finishData, setFinishData] = useState({
    kmFim: "",
    endAt: "",
  });

  // Cancel reason
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.getTrips({ 
          page, 
          limit: 10,
          status: statusFilter !== "todos" ? statusFilter : undefined 
        }),
        api.getVehicles({ limit: 100 }),
        api.getDrivers({ limit: 100 })
      ]);
      setTrips(tripsRes.data);
      setTotalPages(Math.ceil(tripsRes.pagination.total / 10));
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isNewTripOpen) {
      setFormData({
        vehicleId: "",
        driverId: "",
        origin: "",
        destination: "",
        startAt: "",
        kmInicio: "",
        purpose: "",
        tripType: "curta",
      });
      setChecklist({});
      setChecklistObs("");
      setActiveTab("dados");
    }
  }, [isNewTripOpen]);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      (trip.vehicle_model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (trip.driver_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (trip.vehicle_plate?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeTrips = trips.filter((t) => t.status === "em_andamento").length;
  const scheduledTrips = trips.filter((t) => t.status === "agendada").length;
  const completedTrips = trips.filter((t) => t.status === "concluida").length;

  // Validate checklist completion
  const isChecklistComplete = checklistItems.every((item) => checklist[item.id]);

  // Get selected vehicle and driver info
  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const selectedDriver = drivers.find((d) => d.id === formData.driverId);

  // Available vehicles (only disponivel)
  const availableVehicles = vehicles.filter(v => v.status === "disponivel" || v.status === "active");
  
  // Available drivers (only ativo)
  const availableDrivers = drivers.filter(d => d.status === "ativo" || d.status === "active");

  // Handle saving as scheduled
  const handleSaveScheduled = async () => {
    if (!formData.vehicleId || !formData.driverId || !formData.origin || !formData.destination || !formData.startAt) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSaving(true);
      await api.createTrip({
        vehicle_id: formData.vehicleId,
        driver_id: formData.driverId,
        origin: formData.origin,
        destination: formData.destination,
        start_date: formData.startAt,
        start_km: formData.kmInicio ? parseInt(formData.kmInicio) : selectedVehicle?.current_km,
        purpose: formData.purpose,
        trip_type: formData.tripType,
        status: "agendada",
      });

      await loadData();
      setIsNewTripOpen(false);
      toast.success("Viagem agendada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao agendar viagem");
    } finally {
      setSaving(false);
    }
  };

  // Handle starting a trip immediately
  const handleStartTrip = async () => {
    if (!formData.vehicleId || !formData.driverId || !formData.origin || !formData.destination) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!isChecklistComplete) {
      toast.error("Complete todos os itens do checklist antes de iniciar a viagem");
      setActiveTab("checklist");
      return;
    }

    try {
      setSaving(true);
      await api.createTrip({
        vehicle_id: formData.vehicleId,
        driver_id: formData.driverId,
        origin: formData.origin,
        destination: formData.destination,
        start_date: new Date().toISOString(),
        start_km: formData.kmInicio ? parseInt(formData.kmInicio) : selectedVehicle?.current_km,
        purpose: formData.purpose,
        trip_type: formData.tripType,
        status: "em_andamento",
        notes: checklistObs,
      });

      await loadData();
      setIsNewTripOpen(false);
      toast.success("Viagem iniciada com sucesso!");

      if (formData.tripType === "longa") {
        toast.info("Diário de Bordo habilitado para esta viagem", {
          action: {
            label: "Acessar",
            onClick: () => navigate("/diario-bordo"),
          },
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao iniciar viagem");
    } finally {
      setSaving(false);
    }
  };

  // Handle finishing a trip
  const handleOpenFinish = (trip: Trip) => {
    setSelectedTrip(trip);
    setFinishData({ kmFim: "", endAt: "" });
    setIsFinishOpen(true);
  };

  const confirmFinishTrip = async () => {
    if (!selectedTrip) return;

    const kmFim = parseInt(finishData.kmFim);
    if (!kmFim || kmFim < selectedTrip.start_km) {
      toast.error("KM final deve ser maior ou igual ao KM inicial");
      return;
    }

    try {
      setSaving(true);
      await api.finishTrip(selectedTrip.id, {
        end_km: kmFim,
        end_date: finishData.endAt ? new Date(finishData.endAt).toISOString() : new Date().toISOString(),
      });

      await loadData();
      setIsFinishOpen(false);
      setSelectedTrip(null);
      toast.success("Viagem finalizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao finalizar viagem");
    } finally {
      setSaving(false);
    }
  };

  // Handle canceling a trip
  const handleOpenCancel = (trip: Trip) => {
    setSelectedTrip(trip);
    setCancelReason("");
    setIsCancelOpen(true);
  };

  const confirmCancelTrip = async () => {
    if (!selectedTrip) return;

    if (!cancelReason.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }

    try {
      setSaving(true);
      await api.cancelTrip(selectedTrip.id, cancelReason);

      await loadData();
      setIsCancelOpen(false);
      setSelectedTrip(null);
      toast.success("Viagem cancelada");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar viagem");
    } finally {
      setSaving(false);
    }
  };

  // View trip details
  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsViewOpen(true);
  };

  // Navigate to travel log
  const handleOpenTravelLog = (trip: Trip) => {
    navigate(`/diario-bordo?tripId=${trip.id}`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("pt-BR");
  };

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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Viagens</h2>
            <p className="text-muted-foreground">
              Gerencie as viagens e deslocamentos da frota
            </p>
          </div>
          <Button className="btn-primary-glow" onClick={() => setIsNewTripOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Viagem
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-primary">{activeTrips}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-foreground">{scheduledTrips}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizadas (mês)</p>
                <p className="text-2xl font-bold text-success">{completedTrips}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por veículo, motorista, placa ou rota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="concluida">Finalizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Veículo / Motorista</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma viagem encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip) => (
                  <TableRow key={trip.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                          <Route className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{trip.vehicle_model || "Veículo"}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.vehicle_plate} • {trip.driver_name || "Motorista"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {trip.origin} → {trip.destination}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTripTypeBadge(trip.trip_type)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDate(trip.start_date)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium text-foreground">
                          {trip.start_km?.toLocaleString()}
                        </span>
                        {trip.end_km && (
                          <>
                            <span className="text-muted-foreground"> → </span>
                            <span className="font-medium text-foreground">
                              {trip.end_km.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({(trip.end_km - trip.start_km).toLocaleString()} km)
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTrip(trip)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          
                          {trip.trip_type === "longa" && trip.status !== "cancelada" && (
                            <DropdownMenuItem onClick={() => handleOpenTravelLog(trip)}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Diário de Bordo
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {trip.status === "em_andamento" && (
                            <DropdownMenuItem onClick={() => handleOpenFinish(trip)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Finalizar Viagem
                            </DropdownMenuItem>
                          )}
                          
                          {(trip.status === "agendada" || trip.status === "em_andamento") && (
                            <DropdownMenuItem 
                              onClick={() => handleOpenCancel(trip)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* New Trip Dialog */}
      <Dialog open={isNewTripOpen} onOpenChange={setIsNewTripOpen}>
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
                Checklist ({Object.values(checklist).filter(Boolean).length}/{checklistItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Veículo *</Label>
                  <Select 
                    value={formData.vehicleId} 
                    onValueChange={(v) => {
                      const vehicle = vehicles.find(veh => veh.id === v);
                      setFormData({ 
                        ...formData, 
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
                    value={formData.driverId} 
                    onValueChange={(v) => setFormData({ ...formData, driverId: v })}
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
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destino *</Label>
                  <Input 
                    placeholder="Cidade, UF"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data/Hora Saída</Label>
                  <Input 
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KM Inicial</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={formData.kmInicio}
                    onChange={(e) => setFormData({ ...formData, kmInicio: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Viagem *</Label>
                <RadioGroup 
                  value={formData.tripType} 
                  onValueChange={(v) => setFormData({ ...formData, tripType: v as "curta" | "longa" })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="curta" id="curta" />
                    <Label htmlFor="curta" className="font-normal">Curta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="longa" id="longa" />
                    <Label htmlFor="longa" className="font-normal">Longa (habilita Diário de Bordo)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Finalidade da Viagem</Label>
                <Textarea 
                  placeholder="Descreva o motivo da viagem..."
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
                        checked={checklist[item.id] || false}
                        onCheckedChange={(checked) => setChecklist({ ...checklist, [item.id]: checked as boolean })}
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
              
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea 
                  placeholder="Observações adicionais sobre o estado do veículo..."
                  rows={3}
                  value={checklistObs}
                  onChange={(e) => setChecklistObs(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNewTripOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleSaveScheduled} disabled={saving}>
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

      {/* View Trip Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Viagem</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Veículo</p>
                  <p className="font-medium">{selectedTrip.vehicle_model} - {selectedTrip.vehicle_plate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Motorista</p>
                  <p className="font-medium">{selectedTrip.driver_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Origem</p>
                  <p className="font-medium">{selectedTrip.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-medium">{selectedTrip.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Saída</p>
                  <p className="font-medium">{formatDate(selectedTrip.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chegada</p>
                  <p className="font-medium">{selectedTrip.end_date ? formatDate(selectedTrip.end_date) : "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">KM Inicial</p>
                  <p className="font-medium">{selectedTrip.start_km?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KM Final</p>
                  <p className="font-medium">{selectedTrip.end_km?.toLocaleString() || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(selectedTrip.status)}</div>
              </div>
              {selectedTrip.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground">Finalidade</p>
                  <p className="font-medium">{selectedTrip.purpose}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Trip Dialog */}
      <Dialog open={isFinishOpen} onOpenChange={setIsFinishOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Finalizar Viagem</DialogTitle>
            <DialogDescription>
              Informe os dados de conclusão da viagem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>KM Final *</Label>
              <Input
                type="number"
                placeholder="0"
                value={finishData.kmFim}
                onChange={(e) => setFinishData({ ...finishData, kmFim: e.target.value })}
              />
              {selectedTrip && (
                <p className="text-xs text-muted-foreground">
                  KM inicial: {selectedTrip.start_km?.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Data/Hora Chegada</Label>
              <Input
                type="datetime-local"
                value={finishData.endAt}
                onChange={(e) => setFinishData({ ...finishData, endAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFinishOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmFinishTrip} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Trip Dialog */}
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar viagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo do cancelamento. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo do cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelTrip} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
