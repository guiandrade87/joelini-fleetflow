import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  BookOpen,
  Fuel,
  Wrench,
  Receipt,
  Utensils,
  Hotel,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Link,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Camera,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Tipos de despesa padronizados
const expenseTypes = [
  { id: "abastecimento", label: "Abastecimento", icon: Fuel, requiresLink: "fueling" },
  { id: "manutencao", label: "Manutenção", icon: Wrench, requiresLink: "maintenance" },
  { id: "pedagio", label: "Pedágio", icon: Receipt, requiresLink: null },
  { id: "alimentacao", label: "Alimentação", icon: Utensils, requiresLink: null },
  { id: "hospedagem", label: "Hospedagem", icon: Hotel, requiresLink: null },
  { id: "outros", label: "Outros", icon: MoreHorizontal, requiresLink: null },
];

interface Expense {
  id: string;
  tripId: string;
  date: string;
  type: string;
  value: number;
  description: string;
  receipt?: string;
  linkedRecordId?: string;
  linkedRecordType?: "fueling" | "maintenance";
  createdBy: string;
  createdAt: string;
}

interface TravelLogTrip {
  id: string;
  vehicle: string;
  plate: string;
  driver: string;
  origin: string;
  destination: string;
  tripType: "curta" | "longa";
  travelLogEnabled: boolean;
  status: "em_andamento" | "finalizada";
  startAt: string;
  endAt: string | null;
  kmInicio: number;
  kmFim: number | null;
  totalExpenses: number;
  expenseCount: number;
}

// Mock de viagens longas com diário de bordo
const mockTravelLogTrips: TravelLogTrip[] = [
  {
    id: "1",
    vehicle: "Volvo FH 540",
    plate: "ABC-1234",
    driver: "João Silva",
    origin: "São Paulo, SP",
    destination: "Porto Alegre, RS",
    tripType: "longa",
    travelLogEnabled: true,
    status: "em_andamento",
    startAt: "10/01/2024 06:00",
    endAt: null,
    kmInicio: 124500,
    kmFim: null,
    totalExpenses: 3542.50,
    expenseCount: 8,
  },
  {
    id: "2",
    vehicle: "Scania R450",
    plate: "DEF-5678",
    driver: "Maria Santos",
    origin: "São Paulo, SP",
    destination: "Salvador, BA",
    tripType: "longa",
    travelLogEnabled: true,
    status: "em_andamento",
    startAt: "12/01/2024 05:30",
    endAt: null,
    kmInicio: 97500,
    kmFim: null,
    totalExpenses: 1856.30,
    expenseCount: 5,
  },
  {
    id: "3",
    vehicle: "Mercedes Actros",
    plate: "GHI-9012",
    driver: "Pedro Oliveira",
    origin: "Curitiba, PR",
    destination: "Recife, PE",
    tripType: "longa",
    travelLogEnabled: true,
    status: "finalizada",
    startAt: "05/01/2024 04:00",
    endAt: "08/01/2024 18:30",
    kmInicio: 44000,
    kmFim: 47200,
    totalExpenses: 5230.80,
    expenseCount: 12,
  },
];

// Mock de despesas
const mockExpenses: Expense[] = [
  { id: "1", tripId: "1", date: "10/01/2024", type: "abastecimento", value: 1850.00, description: "Abastecimento completo", linkedRecordId: "1", linkedRecordType: "fueling", createdBy: "João Silva", createdAt: "10/01/2024 08:30" },
  { id: "2", tripId: "1", date: "10/01/2024", type: "pedagio", value: 45.50, description: "Pedágio Anhanguera", createdBy: "João Silva", createdAt: "10/01/2024 09:15" },
  { id: "3", tripId: "1", date: "10/01/2024", type: "alimentacao", value: 65.00, description: "Almoço restaurante rodoviário", createdBy: "João Silva", createdAt: "10/01/2024 12:30" },
  { id: "4", tripId: "1", date: "10/01/2024", type: "pedagio", value: 32.00, description: "Pedágio Régis Bittencourt", createdBy: "João Silva", createdAt: "10/01/2024 14:45" },
  { id: "5", tripId: "1", date: "10/01/2024", type: "hospedagem", value: 180.00, description: "Pernoite Hotel Beira Rio", createdBy: "João Silva", createdAt: "10/01/2024 22:00" },
  { id: "6", tripId: "1", date: "11/01/2024", type: "alimentacao", value: 35.00, description: "Café da manhã", createdBy: "João Silva", createdAt: "11/01/2024 07:00" },
  { id: "7", tripId: "1", date: "11/01/2024", type: "abastecimento", value: 1250.00, description: "Abastecimento parcial", linkedRecordId: "2", linkedRecordType: "fueling", createdBy: "João Silva", createdAt: "11/01/2024 10:20" },
  { id: "8", tripId: "1", date: "11/01/2024", type: "manutencao", value: 85.00, description: "Calibragem e revisão pneus", linkedRecordId: "1", linkedRecordType: "maintenance", createdBy: "João Silva", createdAt: "11/01/2024 11:00" },
  { id: "9", tripId: "2", date: "12/01/2024", type: "abastecimento", value: 1200.00, description: "Abastecimento inicial", linkedRecordId: "3", linkedRecordType: "fueling", createdBy: "Maria Santos", createdAt: "12/01/2024 06:00" },
  { id: "10", tripId: "2", date: "12/01/2024", type: "pedagio", value: 156.30, description: "Pedágios diversos", createdBy: "Maria Santos", createdAt: "12/01/2024 15:00" },
  { id: "11", tripId: "2", date: "12/01/2024", type: "alimentacao", value: 120.00, description: "Refeições do dia", createdBy: "Maria Santos", createdAt: "12/01/2024 20:00" },
  { id: "12", tripId: "2", date: "12/01/2024", type: "hospedagem", value: 200.00, description: "Pernoite", createdBy: "Maria Santos", createdAt: "12/01/2024 23:00" },
  { id: "13", tripId: "2", date: "13/01/2024", type: "alimentacao", value: 180.00, description: "Refeições", createdBy: "Maria Santos", createdAt: "13/01/2024 20:00" },
];

// Mock de abastecimentos disponíveis para vincular
const availableFuelings = [
  { id: "1", date: "10/01/2024", vehicle: "ABC-1234", liters: 350, value: 1850.00, station: "Posto Shell BR-116" },
  { id: "2", date: "11/01/2024", vehicle: "ABC-1234", liters: 250, value: 1250.00, station: "Posto Ipiranga Registro" },
  { id: "3", date: "12/01/2024", vehicle: "DEF-5678", liters: 230, value: 1200.00, station: "Posto BR Fernandópolis" },
];

// Mock de manutenções disponíveis para vincular
const availableMaintenances = [
  { id: "1", date: "11/01/2024", vehicle: "ABC-1234", description: "Calibragem e revisão pneus", value: 85.00 },
  { id: "2", date: "08/01/2024", vehicle: "GHI-9012", description: "Troca de óleo", value: 450.00 },
];

export default function TravelLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedTrip, setSelectedTrip] = useState<TravelLogTrip | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  
  // Form state para nova despesa
  const [newExpense, setNewExpense] = useState({
    date: "",
    type: "",
    value: "",
    description: "",
    linkedRecordId: "",
  });

  const filteredTrips = mockTravelLogTrips.filter((trip) => {
    const matchesSearch =
      trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tripExpenses = selectedTrip
    ? mockExpenses.filter((e) => e.tripId === selectedTrip.id)
    : [];

  const getExpenseIcon = (type: string) => {
    const expenseType = expenseTypes.find((e) => e.id === type);
    return expenseType ? expenseType.icon : Receipt;
  };

  const getExpenseLabel = (type: string) => {
    const expenseType = expenseTypes.find((e) => e.id === type);
    return expenseType ? expenseType.label : type;
  };

  const requiresLink = (type: string) => {
    const expenseType = expenseTypes.find((e) => e.id === type);
    return expenseType?.requiresLink;
  };

  const handleAddExpense = () => {
    const linkType = requiresLink(newExpense.type);
    
    // Validação: tipo obrigatório
    if (!newExpense.type) {
      toast.error("Selecione o tipo de despesa");
      return;
    }
    
    // Validação: data obrigatória
    if (!newExpense.date) {
      toast.error("Informe a data da despesa");
      return;
    }
    
    // Validação: valor obrigatório
    if (!newExpense.value || parseFloat(newExpense.value) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    
    // Validação: vínculo obrigatório para abastecimento e manutenção
    if (linkType && !newExpense.linkedRecordId) {
      toast.error(`${getExpenseLabel(newExpense.type)} requer vinculação com registro existente`);
      setIsLinkDialogOpen(true);
      return;
    }
    
    toast.success("Despesa registrada com sucesso!");
    setIsExpenseDialogOpen(false);
    setNewExpense({ date: "", type: "", value: "", description: "", linkedRecordId: "" });
  };

  const handleDeleteExpense = () => {
    if (expenseToDelete) {
      toast.success("Despesa excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const calculateExpensesByType = (tripId: string) => {
    const expenses = mockExpenses.filter((e) => e.tripId === tripId);
    const byType: Record<string, number> = {};
    
    expenses.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + e.value;
    });
    
    return byType;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Stats
  const totalTripsWithLog = mockTravelLogTrips.length;
  const activeTripsWithLog = mockTravelLogTrips.filter((t) => t.status === "em_andamento").length;
  const totalExpensesValue = mockTravelLogTrips.reduce((acc, t) => acc + t.totalExpenses, 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              Diário de Bordo
            </h2>
            <p className="text-muted-foreground">
              Controle de despesas em viagens longas
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viagens com Diário</p>
                <p className="text-2xl font-bold text-primary">{totalTripsWithLog}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-foreground">{activeTripsWithLog}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Despesas</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalExpensesValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-warning" />
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Travel Log List */}
        <div className="grid gap-4">
          {filteredTrips.map((trip) => {
            const expensesByType = calculateExpensesByType(trip.id);
            
            return (
              <Card key={trip.id} className="card-elevated overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {trip.vehicle}
                          <Badge variant="outline" className="ml-2">
                            {trip.plate}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {trip.driver} • {trip.origin} → {trip.destination}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          trip.status === "em_andamento" 
                            ? "bg-primary/10 text-primary border-0" 
                            : "bg-success/10 text-success border-0"
                        }
                      >
                        {trip.status === "em_andamento" ? "Em Andamento" : "Finalizada"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTrip(trip);
                            setIsViewDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {trip.status === "em_andamento" && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedTrip(trip);
                              setIsExpenseDialogOpen(true);
                            }}>
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Despesa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Saída</p>
                      <p className="text-sm font-medium">{trip.startAt}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">KM Inicial</p>
                      <p className="text-sm font-medium">{trip.kmInicio.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Despesas</p>
                      <p className="text-sm font-medium">{trip.expenseCount} lançamentos</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-warning/10">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-bold text-warning">{formatCurrency(trip.totalExpenses)}</p>
                    </div>
                  </div>
                  
                  {/* Expense breakdown by type */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(expensesByType).map(([type, value]) => {
                      const Icon = getExpenseIcon(type);
                      return (
                        <Badge key={type} variant="secondary" className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {getExpenseLabel(type)}: {formatCurrency(value)}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma viagem com diário de bordo encontrada
            </h3>
            <p className="text-muted-foreground">
              Viagens longas terão o diário de bordo habilitado automaticamente.
            </p>
          </div>
        )}

        {/* View Trip Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Diário de Bordo - {selectedTrip?.vehicle}
              </DialogTitle>
              <DialogDescription>
                {selectedTrip?.origin} → {selectedTrip?.destination}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expenses">Despesas</TabsTrigger>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses" className="space-y-4 pt-4">
                {selectedTrip?.status === "em_andamento" && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setIsExpenseDialogOpen(true)}
                      className="btn-primary-glow"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Despesa
                    </Button>
                  </div>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vínculo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tripExpenses.map((expense) => {
                      const Icon = getExpenseIcon(expense.type);
                      const hasLink = expense.linkedRecordId;
                      
                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm">{expense.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{getExpenseLabel(expense.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {expense.description}
                          </TableCell>
                          <TableCell>
                            {hasLink ? (
                              <Badge variant="outline" className="text-success border-success">
                                <Link className="h-3 w-3 mr-1" />
                                Vinculado
                              </Badge>
                            ) : requiresLink(expense.type) ? (
                              <Badge variant="outline" className="text-destructive border-destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Sem vínculo
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(expense.value)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setExpenseToDelete(expense);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {tripExpenses.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma despesa registrada</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="summary" className="space-y-4 pt-4">
                {selectedTrip && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">Total de Despesas</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(selectedTrip.totalExpenses)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">Lançamentos</p>
                          <p className="text-2xl font-bold">{selectedTrip.expenseCount}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">KM Percorrido</p>
                          <p className="text-2xl font-bold">
                            {selectedTrip.kmFim 
                              ? (selectedTrip.kmFim - selectedTrip.kmInicio).toLocaleString()
                              : "Em andamento"
                            }
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">Custo por KM</p>
                          <p className="text-2xl font-bold text-warning">
                            {selectedTrip.kmFim 
                              ? formatCurrency(selectedTrip.totalExpenses / (selectedTrip.kmFim - selectedTrip.kmInicio))
                              : "-"
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Despesas por Categoria</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(calculateExpensesByType(selectedTrip.id)).map(([type, value]) => {
                            const Icon = getExpenseIcon(type);
                            const percentage = (value / selectedTrip.totalExpenses) * 100;
                            
                            return (
                              <div key={type} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-accent-foreground" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">{getExpenseLabel(type)}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {formatCurrency(value)} ({percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
              <DialogDescription>
                Adicione uma nova despesa ao diário de bordo desta viagem.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input 
                    type="date" 
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0,00"
                    value={newExpense.value}
                    onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Despesa *</Label>
                <Select 
                  value={newExpense.type}
                  onValueChange={(value) => setNewExpense({ ...newExpense, type: value, linkedRecordId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                          {type.requiresLink && (
                            <Badge variant="outline" className="text-xs ml-2">
                              Requer vínculo
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Link selector for fuel/maintenance */}
              {(newExpense.type === "abastecimento" || newExpense.type === "manutencao") && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Vincular a Registro *
                  </Label>
                  <Select 
                    value={newExpense.linkedRecordId}
                    onValueChange={(value) => setNewExpense({ ...newExpense, linkedRecordId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione ${newExpense.type === "abastecimento" ? "o abastecimento" : "a manutenção"}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {newExpense.type === "abastecimento" && availableFuelings
                        .filter(f => f.vehicle === selectedTrip?.plate)
                        .map((fueling) => (
                          <SelectItem key={fueling.id} value={fueling.id}>
                            {fueling.date} - {fueling.liters}L - {formatCurrency(fueling.value)} ({fueling.station})
                          </SelectItem>
                        ))
                      }
                      {newExpense.type === "manutencao" && availableMaintenances
                        .filter(m => m.vehicle === selectedTrip?.plate)
                        .map((maintenance) => (
                          <SelectItem key={maintenance.id} value={maintenance.id}>
                            {maintenance.date} - {maintenance.description} - {formatCurrency(maintenance.value)}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {newExpense.type === "abastecimento" 
                      ? "Vincule a um registro de abastecimento existente para garantir consistência dos dados."
                      : "Vincule a um registro de manutenção existente para garantir rastreabilidade."
                    }
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  placeholder="Descrição da despesa..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Comprovante
                </Label>
                <Input type="file" accept="image/*,.pdf" />
                <p className="text-xs text-muted-foreground">
                  Anexe foto ou PDF do comprovante (opcional)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddExpense}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Registrar Despesa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteExpense} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
