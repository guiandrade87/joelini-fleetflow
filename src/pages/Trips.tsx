import { useState } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";

interface Trip {
  id: string;
  vehicle: string;
  plate: string;
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
}

const mockTrips: Trip[] = [
  {
    id: "1",
    vehicle: "Fiat Strada",
    plate: "ABC-1234",
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
  },
  {
    id: "2",
    vehicle: "VW Saveiro",
    plate: "DEF-5678",
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
  },
  {
    id: "3",
    vehicle: "Fiat Ducato",
    plate: "GHI-9012",
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
  },
  {
    id: "4",
    vehicle: "Renault Master",
    plate: "JKL-3456",
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
  },
  {
    id: "5",
    vehicle: "Fiat Toro",
    plate: "MNO-7890",
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
  },
];

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
          <Square className="h-3 w-3 mr-1" />
          Cancelada
        </Badge>
      );
  }
};

export default function Trips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesSearch =
      trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTrips = mockTrips.filter((t) => t.status === "em_andamento").length;
  const scheduledTrips = mockTrips.filter((t) => t.status === "agendada").length;

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
          <Dialog open={isNewTripOpen} onOpenChange={setIsNewTripOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow">
                <Plus className="h-4 w-4 mr-2" />
                Nova Viagem
              </Button>
            </DialogTrigger>
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
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="veiculo">Veículo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o veículo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Fiat Strada - ABC-1234</SelectItem>
                          <SelectItem value="2">VW Saveiro - DEF-5678</SelectItem>
                          <SelectItem value="4">Renault Master - JKL-3456</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motorista">Motorista</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motorista" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">João Silva</SelectItem>
                          <SelectItem value="3">Maria Santos</SelectItem>
                          <SelectItem value="4">Pedro Costa</SelectItem>
                          <SelectItem value="5">Ana Rodrigues</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origem">Origem</Label>
                      <Input id="origem" placeholder="Cidade, UF" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destino">Destino</Label>
                      <Input id="destino" placeholder="Cidade, UF" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataHoraSaida">Data/Hora Saída</Label>
                      <Input id="dataHoraSaida" type="datetime-local" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kmInicio">KM Inicial</Label>
                      <Input id="kmInicio" type="number" placeholder="0" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="finalidade">Finalidade da Viagem</Label>
                    <Textarea 
                      id="finalidade" 
                      placeholder="Descreva o motivo da viagem..."
                      rows={3}
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
                          <Checkbox id={item.id} />
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
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes" 
                      placeholder="Observações adicionais sobre o estado do veículo..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewTripOpen(false)}
                >
                  Cancelar
                </Button>
                <Button variant="secondary">
                  Salvar como Agendada
                </Button>
                <Button onClick={() => setIsNewTripOpen(false)}>
                  Iniciar Viagem
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <p className="text-2xl font-bold text-success">
                  {mockTrips.filter((t) => t.status === "finalizada").length}
                </p>
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
                placeholder="Buscar por veículo, motorista ou placa..."
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
                <TableHead>Saída</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                        <Route className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {trip.vehicle}
                        </p>
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
                    <span className="text-sm text-muted-foreground">
                      {trip.startAt}
                    </span>
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {trip.status === "em_andamento" && (
                          <DropdownMenuItem>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Finalizar Viagem
                          </DropdownMenuItem>
                        )}
                        {trip.status === "agendada" && (
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Viagem
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredTrips.length} de {mockTrips.length} viagens
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
