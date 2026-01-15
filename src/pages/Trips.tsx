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
  Square,
  Eye,
  BookOpen,
  AlertCircle,
  X,
  Edit,
  Ban,
} from "lucide-react";
import { mockVehicles, mockDrivers } from "@/lib/mockData";

interface Trip {
  id: string;
  vehicleId: string;
  vehicle: string;
  plate: string;
  driverId: string;
  driver: string;
  origin: string;
  destination: string;
  purpose: string;
  kmInicio: number;
  kmFim: number | null;
  startAt: string;
  endAt: string | null;
  status: "agendada" | "em_andamento" | "finalizada" | "cancelada";
  tripType: "curta" | "longa";
  travelLogEnabled: boolean;
  checklist: Record<string, boolean>;
  checklistObs: string;
  cancelReason?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
}

const initialTrips: Trip[] = [
  {
    id: "1",
    vehicleId: "1",
    vehicle: "Fiat Strada",
    plate: "ABC-1234",
    driverId: "1",
    driver: "João Silva",
    origin: "São Paulo, SP",
    destination: "Campinas, SP",
    purpose: "Entrega de materiais",
    kmInicio: 45230,
    kmFim: null,
    startAt: "11/12/2024 08:30",
    endAt: null,
    status: "em_andamento",
    tripType: "curta",
    travelLogEnabled: false,
    checklist: {
      niveis: true,
      pneus: true,
      luzes: true,
      freios: true,
      limpador: true,
      macaco: true,
      extintor: true,
      triangulo: true,
      documentos: true,
      estepe: true,
    },
    checklistObs: "",
  },
  {
    id: "2",
    vehicleId: "2",
    vehicle: "VW Saveiro",
    plate: "DEF-5678",
    driverId: "2",
    driver: "Carlos Oliveira",
    origin: "São Paulo, SP",
    destination: "Porto Alegre, RS",
    purpose: "Entrega interestadual",
    kmInicio: 62100,
    kmFim: 63450,
    startAt: "10/12/2024 07:00",
    endAt: "11/12/2024 18:30",
    status: "finalizada",
    tripType: "longa",
    travelLogEnabled: true,
    checklist: {
      niveis: true,
      pneus: true,
      luzes: true,
      freios: true,
      limpador: true,
      macaco: true,
      extintor: true,
      triangulo: true,
      documentos: true,
      estepe: true,
    },
    checklistObs: "Veículo em bom estado",
  },
  {
    id: "3",
    vehicleId: "3",
    vehicle: "Fiat Ducato",
    plate: "GHI-9012",
    driverId: "3",
    driver: "Maria Santos",
    origin: "São Paulo, SP",
    destination: "Santos, SP",
    purpose: "Coleta de equipamentos",
    kmInicio: 89450,
    kmFim: 89535,
    startAt: "10/12/2024 09:00",
    endAt: "10/12/2024 15:00",
    status: "finalizada",
    tripType: "curta",
    travelLogEnabled: false,
    checklist: {
      niveis: true,
      pneus: true,
      luzes: true,
      freios: true,
      limpador: false,
      macaco: true,
      extintor: true,
      triangulo: true,
      documentos: true,
      estepe: true,
    },
    checklistObs: "Limpador com defeito, notificado à manutenção",
  },
  {
    id: "4",
    vehicleId: "4",
    vehicle: "Renault Master",
    plate: "JKL-3456",
    driverId: "4",
    driver: "Pedro Costa",
    origin: "São Paulo, SP",
    destination: "Guarulhos, SP",
    purpose: "Entrega urgente",
    kmInicio: 23100,
    kmFim: null,
    startAt: "12/12/2024 10:00",
    endAt: null,
    status: "agendada",
    tripType: "curta",
    travelLogEnabled: false,
    checklist: {},
    checklistObs: "",
  },
  {
    id: "5",
    vehicleId: "5",
    vehicle: "Fiat Toro",
    plate: "MNO-7890",
    driverId: "5",
    driver: "Ana Rodrigues",
    origin: "São Paulo, SP",
    destination: "Salvador, BA",
    purpose: "Visita a cliente",
    kmInicio: 38920,
    kmFim: null,
    startAt: "11/12/2024 14:00",
    endAt: null,
    status: "em_andamento",
    tripType: "longa",
    travelLogEnabled: true,
    checklist: {
      niveis: true,
      pneus: true,
      luzes: true,
      freios: true,
      limpador: true,
      macaco: true,
      extintor: true,
      triangulo: true,
      documentos: true,
      estepe: true,
    },
    checklistObs: "",
  },
];

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
    case "finalizada":
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

const getTripTypeBadge = (tripType: Trip["tripType"], travelLogEnabled: boolean) => {
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

// Available vehicles (only those with status 'active' or 'disponivel')
const availableVehicles = mockVehicles.filter(
  (v) => v.status === "active" || v.status === "disponivel"
);

// Available drivers (only those with status 'active' or 'ativo')
const availableDrivers = mockDrivers.filter(
  (d) => d.status === "active" || d.status === "ativo"
);

export default function Trips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Dialog states
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState("dados");

  // Form state for new/edit trip
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
      trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTrips = trips.filter((t) => t.status === "em_andamento").length;
  const scheduledTrips = trips.filter((t) => t.status === "agendada").length;
  const completedTrips = trips.filter((t) => t.status === "finalizada").length;

  // Validate checklist completion
  const isChecklistComplete = checklistItems.every((item) => checklist[item.id]);

  // Get selected vehicle and driver info
  const selectedVehicle = mockVehicles.find((v) => v.id === formData.vehicleId);
  const selectedDriver = mockDrivers.find((d) => d.id === formData.driverId);

  // Handle saving as scheduled
  const handleSaveScheduled = () => {
    if (!formData.vehicleId || !formData.driverId || !formData.origin || !formData.destination || !formData.startAt) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const vehicle = mockVehicles.find((v) => v.id === formData.vehicleId);
    const driver = mockDrivers.find((d) => d.id === formData.driverId);

    if (!vehicle || !driver) {
      toast.error("Veículo ou motorista inválido");
      return;
    }

    const newTrip: Trip = {
      id: String(trips.length + 1),
      vehicleId: formData.vehicleId,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      plate: vehicle.plate,
      driverId: formData.driverId,
      driver: driver.name,
      origin: formData.origin,
      destination: formData.destination,
      purpose: formData.purpose,
      kmInicio: formData.kmInicio ? parseInt(formData.kmInicio) : vehicle.current_km,
      kmFim: null,
      startAt: new Date(formData.startAt).toLocaleString("pt-BR"),
      endAt: null,
      status: "agendada",
      tripType: formData.tripType,
      travelLogEnabled: formData.tripType === "longa",
      checklist: {},
      checklistObs: "",
    };

    setTrips([newTrip, ...trips]);
    setIsNewTripOpen(false);
    toast.success("Viagem agendada com sucesso!");
  };

  // Handle starting a trip immediately
  const handleStartTrip = () => {
    if (!formData.vehicleId || !formData.driverId || !formData.origin || !formData.destination) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!isChecklistComplete) {
      toast.error("Complete todos os itens do checklist antes de iniciar a viagem");
      setActiveTab("checklist");
      return;
    }

    const vehicle = mockVehicles.find((v) => v.id === formData.vehicleId);
    const driver = mockDrivers.find((d) => d.id === formData.driverId);

    if (!vehicle || !driver) {
      toast.error("Veículo ou motorista inválido");
      return;
    }

    const newTrip: Trip = {
      id: String(trips.length + 1),
      vehicleId: formData.vehicleId,
      vehicle: `${vehicle.brand} ${vehicle.model}`,
      plate: vehicle.plate,
      driverId: formData.driverId,
      driver: driver.name,
      origin: formData.origin,
      destination: formData.destination,
      purpose: formData.purpose,
      kmInicio: formData.kmInicio ? parseInt(formData.kmInicio) : vehicle.current_km,
      kmFim: null,
      startAt: new Date().toLocaleString("pt-BR"),
      endAt: null,
      status: "em_andamento",
      tripType: formData.tripType,
      travelLogEnabled: formData.tripType === "longa",
      checklist: { ...checklist },
      checklistObs,
    };

    setTrips([newTrip, ...trips]);
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
  };

  // Handle starting a scheduled trip
  const handleStartScheduledTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setChecklist({});
    setChecklistObs("");
    setIsStartOpen(true);
  };

  const confirmStartTrip = () => {
    if (!selectedTrip) return;

    if (!isChecklistComplete) {
      toast.error("Complete todos os itens do checklist antes de iniciar a viagem");
      return;
    }

    setTrips(
      trips.map((t) =>
        t.id === selectedTrip.id
          ? {
              ...t,
              status: "em_andamento" as const,
              startAt: new Date().toLocaleString("pt-BR"),
              checklist: { ...checklist },
              checklistObs,
            }
          : t
      )
    );

    setIsStartOpen(false);
    setSelectedTrip(null);
    toast.success("Viagem iniciada com sucesso!");

    if (selectedTrip.tripType === "longa") {
      toast.info("Diário de Bordo habilitado para esta viagem", {
        action: {
          label: "Acessar",
          onClick: () => navigate("/diario-bordo"),
        },
      });
    }
  };

  // Handle finishing a trip
  const handleOpenFinish = (trip: Trip) => {
    setSelectedTrip(trip);
    setFinishData({ kmFim: "", endAt: "" });
    setIsFinishOpen(true);
  };

  const confirmFinishTrip = () => {
    if (!selectedTrip) return;

    const kmFim = parseInt(finishData.kmFim);
    if (!kmFim || kmFim < selectedTrip.kmInicio) {
      toast.error("KM final deve ser maior ou igual ao KM inicial");
      return;
    }

    setTrips(
      trips.map((t) =>
        t.id === selectedTrip.id
          ? {
              ...t,
              status: "finalizada" as const,
              kmFim,
              endAt: finishData.endAt
                ? new Date(finishData.endAt).toLocaleString("pt-BR")
                : new Date().toLocaleString("pt-BR"),
            }
          : t
      )
    );

    setIsFinishOpen(false);
    setSelectedTrip(null);
    toast.success("Viagem finalizada com sucesso!");
  };

  // Handle canceling a trip
  const handleOpenCancel = (trip: Trip) => {
    setSelectedTrip(trip);
    setCancelReason("");
    setIsCancelOpen(true);
  };

  const confirmCancelTrip = () => {
    if (!selectedTrip) return;

    if (!cancelReason.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }

    setTrips(
      trips.map((t) =>
        t.id === selectedTrip.id
          ? {
              ...t,
              status: "cancelada" as const,
              cancelReason,
            }
          : t
      )
    );

    setIsCancelOpen(false);
    setSelectedTrip(null);
    toast.success("Viagem cancelada");
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
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
                          <p className="font-medium text-foreground">{trip.vehicle}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.plate} • {trip.driver}
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
                      {getTripTypeBadge(trip.tripType, trip.travelLogEnabled)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{trip.startAt}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium text-foreground">
                          {trip.kmInicio.toLocaleString()}
                        </span>
                        {trip.kmFim && (
                          <>
                            <span className="text-muted-foreground"> → </span>
                            <span className="font-medium text-foreground">
                              {trip.kmFim.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({(trip.kmFim - trip.kmInicio).toLocaleString()} km)
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
                          
                          {trip.travelLogEnabled && trip.status !== "cancelada" && (
                            <DropdownMenuItem onClick={() => handleOpenTravelLog(trip)}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Diário de Bordo
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {trip.status === "agendada" && (
                            <>
                              <DropdownMenuItem onClick={() => handleStartScheduledTrip(trip)}>
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar Viagem
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenCancel(trip)}
                                className="text-destructive"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {trip.status === "em_andamento" && (
                            <>
                              <DropdownMenuItem onClick={() => handleOpenFinish(trip)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Finalizar Viagem
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenCancel(trip)}
                                className="text-destructive"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </>
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

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredTrips.length} de {trips.length} viagens
          </p>
        </div>
      </div>

      {/* New Trip Dialog */}
      <Dialog open={isNewTripOpen} onOpenChange={setIsNewTripOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nova Viagem</DialogTitle>
            <DialogDescription>
              Preencha os dados da viagem. O checklist é obrigatório para iniciar.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados da Viagem</TabsTrigger>
              <TabsTrigger value="checklist">
                Checklist
                {!isChecklistComplete && (
                  <AlertCircle className="h-3 w-3 ml-1 text-destructive" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 pt-4">
              {/* Trip Type Selection */}
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <Label className="text-base font-medium">Classificação da Viagem *</Label>
                <p className="text-sm text-muted-foreground">
                  Viagens longas habilitam automaticamente o Diário de Bordo para controle de despesas.
                </p>
                <RadioGroup
                  value={formData.tripType}
                  onValueChange={(value: "curta" | "longa") =>
                    setFormData({ ...formData, tripType: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="curta" id="curta" />
                    <Label htmlFor="curta" className="cursor-pointer">
                      Viagem Curta (região/local)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="longa" id="longa" />
                    <Label htmlFor="longa" className="cursor-pointer">
                      Viagem Longa (fora da região)
                    </Label>
                  </div>
                </RadioGroup>
                {formData.tripType === "longa" && (
                  <div className="flex items-center gap-2 text-sm text-primary mt-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Diário de Bordo será habilitado</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veiculo">Veículo *</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVehicle && (
                    <p className="text-xs text-muted-foreground">
                      KM atual: {selectedVehicle.current_km.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motorista">Motorista *</Label>
                  <Select
                    value={formData.driverId}
                    onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - CNH {driver.cnh_category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDriver && (
                    <p className="text-xs text-muted-foreground">
                      CNH válida até: {new Date(selectedDriver.cnh_expiry).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origem">Origem *</Label>
                  <Input
                    id="origem"
                    placeholder="Cidade, UF"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destino">Destino *</Label>
                  <Input
                    id="destino"
                    placeholder="Cidade, UF"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataHoraSaida">Data/Hora Saída</Label>
                  <Input
                    id="dataHoraSaida"
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmInicio">KM Inicial</Label>
                  <Input
                    id="kmInicio"
                    type="number"
                    placeholder={selectedVehicle ? String(selectedVehicle.current_km) : "0"}
                    value={formData.kmInicio}
                    onChange={(e) => setFormData({ ...formData, kmInicio: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade da Viagem</Label>
                <Textarea
                  id="finalidade"
                  placeholder="Descreva o motivo da viagem..."
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4 pt-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Verifique todos os itens antes de iniciar a viagem.
                  </p>
                  <Badge variant={isChecklistComplete ? "default" : "destructive"}>
                    {Object.values(checklist).filter(Boolean).length} / {checklistItems.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={checklist[item.id] || false}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, [item.id]: checked as boolean })
                        }
                      />
                      <Label htmlFor={item.id} className="text-sm font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais sobre o estado do veículo..."
                  rows={3}
                  value={checklistObs}
                  onChange={(e) => setChecklistObs(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsNewTripOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleSaveScheduled}>
              <Clock className="h-4 w-4 mr-2" />
              Salvar como Agendada
            </Button>
            <Button onClick={handleStartTrip} disabled={!isChecklistComplete}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Viagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Scheduled Trip Dialog */}
      <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Iniciar Viagem</DialogTitle>
            <DialogDescription>
              Complete o checklist de saída para iniciar a viagem.
            </DialogDescription>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Veículo</p>
                    <p className="font-medium">{selectedTrip.vehicle} - {selectedTrip.plate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Motorista</p>
                    <p className="font-medium">{selectedTrip.driver}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rota</p>
                    <p className="font-medium">{selectedTrip.origin} → {selectedTrip.destination}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-medium">
                      {selectedTrip.tripType === "longa" ? "Viagem Longa" : "Viagem Curta"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Checklist de Saída</Label>
                  <Badge variant={isChecklistComplete ? "default" : "destructive"}>
                    {Object.values(checklist).filter(Boolean).length} / {checklistItems.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`start-${item.id}`}
                        checked={checklist[item.id] || false}
                        onCheckedChange={(checked) =>
                          setChecklist({ ...checklist, [item.id]: checked as boolean })
                        }
                      />
                      <Label htmlFor={`start-${item.id}`} className="text-sm font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startObs">Observações</Label>
                <Textarea
                  id="startObs"
                  placeholder="Observações sobre o estado do veículo..."
                  rows={2}
                  value={checklistObs}
                  onChange={(e) => setChecklistObs(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmStartTrip} disabled={!isChecklistComplete}>
              <Play className="h-4 w-4 mr-2" />
              Confirmar Início
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Trip Dialog */}
      <Dialog open={isFinishOpen} onOpenChange={setIsFinishOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Finalizar Viagem</DialogTitle>
            <DialogDescription>
              Informe os dados de conclusão da viagem.
            </DialogDescription>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Veículo</p>
                    <p className="font-medium">{selectedTrip.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Motorista</p>
                    <p className="font-medium">{selectedTrip.driver}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rota</p>
                    <p className="font-medium">{selectedTrip.origin} → {selectedTrip.destination}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">KM Inicial</p>
                    <p className="font-medium">{selectedTrip.kmInicio.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kmFim">KM Final *</Label>
                  <Input
                    id="kmFim"
                    type="number"
                    placeholder="0"
                    min={selectedTrip.kmInicio}
                    value={finishData.kmFim}
                    onChange={(e) => setFinishData({ ...finishData, kmFim: e.target.value })}
                  />
                  {finishData.kmFim && parseInt(finishData.kmFim) > selectedTrip.kmInicio && (
                    <p className="text-xs text-muted-foreground">
                      Distância: {(parseInt(finishData.kmFim) - selectedTrip.kmInicio).toLocaleString()} km
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">Data/Hora Chegada</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={finishData.endAt}
                    onChange={(e) => setFinishData({ ...finishData, endAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFinishOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmFinishTrip}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar Viagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Trip Dialog */}
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Viagem</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A viagem será marcada como cancelada.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedTrip && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <p className="text-sm">
                  <span className="text-muted-foreground">Viagem:</span>{" "}
                  <span className="font-medium">
                    {selectedTrip.origin} → {selectedTrip.destination}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelReason">Motivo do Cancelamento *</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Informe o motivo do cancelamento..."
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelTrip}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Trip Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Viagem</DialogTitle>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedTrip.status)}
                {getTripTypeBadge(selectedTrip.tripType, selectedTrip.travelLogEnabled)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium">{selectedTrip.vehicle}</p>
                    <p className="text-sm text-muted-foreground">{selectedTrip.plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Origem</p>
                    <p className="font-medium">{selectedTrip.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saída</p>
                    <p className="font-medium">{selectedTrip.startAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KM Inicial</p>
                    <p className="font-medium">{selectedTrip.kmInicio.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Motorista</p>
                    <p className="font-medium">{selectedTrip.driver}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destino</p>
                    <p className="font-medium">{selectedTrip.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chegada</p>
                    <p className="font-medium">{selectedTrip.endAt || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KM Final</p>
                    <p className="font-medium">
                      {selectedTrip.kmFim ? selectedTrip.kmFim.toLocaleString() : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTrip.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground">Finalidade</p>
                  <p className="font-medium">{selectedTrip.purpose}</p>
                </div>
              )}

              {selectedTrip.kmFim && (
                <div className="rounded-lg border border-border p-4 bg-muted/20">
                  <p className="text-sm text-muted-foreground">Distância Percorrida</p>
                  <p className="text-2xl font-bold text-primary">
                    {(selectedTrip.kmFim - selectedTrip.kmInicio).toLocaleString()} km
                  </p>
                </div>
              )}

              {Object.keys(selectedTrip.checklist).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Checklist de Saída</p>
                  <div className="grid grid-cols-2 gap-2">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        {selectedTrip.checklist[item.id] ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  {selectedTrip.checklistObs && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Obs: {selectedTrip.checklistObs}
                    </p>
                  )}
                </div>
              )}

              {selectedTrip.cancelReason && (
                <div className="rounded-lg border border-destructive/50 p-4 bg-destructive/10">
                  <p className="text-sm text-destructive font-medium">Motivo do Cancelamento</p>
                  <p className="text-sm">{selectedTrip.cancelReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedTrip?.travelLogEnabled && selectedTrip.status !== "cancelada" && (
              <Button variant="outline" onClick={() => handleOpenTravelLog(selectedTrip)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Diário de Bordo
              </Button>
            )}
            <Button onClick={() => setIsViewOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
