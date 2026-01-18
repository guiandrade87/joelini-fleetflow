import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Trash2,
  MapPin,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Expense types
const expenseTypes = [
  { id: "abastecimento", label: "Abastecimento", icon: Fuel, requiresLink: "fueling" },
  { id: "manutencao", label: "Manutenção", icon: Wrench, requiresLink: "maintenance" },
  { id: "pedagio", label: "Pedágio", icon: Receipt, requiresLink: null },
  { id: "alimentacao", label: "Alimentação", icon: Utensils, requiresLink: null },
  { id: "hospedagem", label: "Hospedagem", icon: Hotel, requiresLink: null },
  { id: "outros", label: "Outros", icon: MoreHorizontal, requiresLink: null },
];

interface TravelLogTrip {
  id: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  driver_name?: string;
  origin: string;
  destination: string;
  trip_type: "curta" | "longa";
  status: "em_andamento" | "concluida" | "agendada" | "cancelada";
  start_date: string;
  end_date?: string;
  start_km: number;
  end_km?: number;
}

interface Expense {
  id: string;
  trip_id: string;
  date: string;
  type: string;
  value: number;
  description: string;
  created_by?: string;
  created_at?: string;
}

export default function TravelLog() {
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get("tripId");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  const [trips, setTrips] = useState<TravelLogTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TravelLogTrip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  
  // Form state for new expense
  const [newExpense, setNewExpense] = useState({
    date: "",
    type: "",
    value: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tripsRes = await api.getTrips({ 
        limit: 100,
        status: statusFilter !== "todos" ? statusFilter : undefined 
      });
      
      // Filter only long trips
      const longTrips = (tripsRes.data || []).filter((t: any) => t.trip_type === "longa");
      setTrips(longTrips);
      
      // If tripId is in URL, select that trip
      if (tripIdParam) {
        const trip = longTrips.find((t: any) => t.id === tripIdParam);
        if (trip) {
          setSelectedTrip(trip);
          setIsViewDialogOpen(true);
        }
      }
    } catch (error) {
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      (trip.vehicle_model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (trip.driver_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (trip.vehicle_plate?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getExpenseIcon = (type: string) => {
    const expenseType = expenseTypes.find((e) => e.id === type);
    return expenseType ? expenseType.icon : Receipt;
  };

  const getExpenseLabel = (type: string) => {
    const expenseType = expenseTypes.find((e) => e.id === type);
    return expenseType ? expenseType.label : type;
  };

  const handleAddExpense = async () => {
    if (!newExpense.type) {
      toast.error("Selecione o tipo de despesa");
      return;
    }
    
    if (!newExpense.date) {
      toast.error("Informe a data da despesa");
      return;
    }
    
    if (!newExpense.value || parseFloat(newExpense.value) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    
    // In a real implementation, this would call an API
    toast.success("Despesa registrada com sucesso!");
    setIsExpenseDialogOpen(false);
    setNewExpense({ date: "", type: "", value: "", description: "" });
  };

  const handleDeleteExpense = async () => {
    if (expenseToDelete) {
      // In a real implementation, this would call an API
      toast.success("Despesa excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  // Stats
  const totalTripsWithLog = trips.length;
  const activeTripsWithLog = trips.filter((t) => t.status === "em_andamento").length;

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
                <p className="text-sm text-muted-foreground">Viagens Longas</p>
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
                <p className="text-2xl font-bold text-warning">{formatCurrency(0)}</p>
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
                <SelectItem value="concluida">Finalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Travel Log List */}
        <div className="grid gap-4">
          {filteredTrips.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma viagem longa encontrada.
              </CardContent>
            </Card>
          ) : (
            filteredTrips.map((trip) => (
              <Card key={trip.id} className="card-elevated overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {trip.vehicle_model || "Veículo"}
                          <Badge variant="outline" className="ml-2">
                            {trip.vehicle_plate}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {trip.driver_name || "Motorista"} • {trip.origin} → {trip.destination}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Saída</p>
                      <p className="text-sm font-medium">{formatDate(trip.start_date)}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Chegada</p>
                      <p className="text-sm font-medium">{trip.end_date ? formatDate(trip.end_date) : "-"}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">KM Inicial</p>
                      <p className="text-sm font-medium">{trip.start_km?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">KM Final</p>
                      <p className="text-sm font-medium">{trip.end_km?.toLocaleString() || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* View Trip Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Diário de Bordo
            </DialogTitle>
            {selectedTrip && (
              <DialogDescription>
                {selectedTrip.vehicle_model} ({selectedTrip.vehicle_plate}) - {selectedTrip.origin} → {selectedTrip.destination}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedTrip && (
            <div className="space-y-6">
              {/* Trip Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Motorista</p>
                  <p className="text-sm font-medium">{selectedTrip.driver_name}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge 
                    className={
                      selectedTrip.status === "em_andamento" 
                        ? "bg-primary/10 text-primary border-0" 
                        : "bg-success/10 text-success border-0"
                    }
                  >
                    {selectedTrip.status === "em_andamento" ? "Em Andamento" : "Finalizada"}
                  </Badge>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Saída</p>
                  <p className="text-sm font-medium">{formatDate(selectedTrip.start_date)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Chegada</p>
                  <p className="text-sm font-medium">{selectedTrip.end_date ? formatDate(selectedTrip.end_date) : "-"}</p>
                </div>
              </div>

              {/* Add Expense Button */}
              {selectedTrip.status === "em_andamento" && (
                <div className="flex justify-end">
                  <Button onClick={() => setIsExpenseDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </div>
              )}

              {/* Expenses Table */}
              <div>
                <h4 className="font-medium mb-3">Despesas Registradas</h4>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.filter(e => e.trip_id === selectedTrip.id).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhuma despesa registrada ainda.
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenses.filter(e => e.trip_id === selectedTrip.id).map((expense) => {
                          const ExpenseIcon = getExpenseIcon(expense.type);
                          return (
                            <TableRow key={expense.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <ExpenseIcon className="h-4 w-4 text-muted-foreground" />
                                  <span>{getExpenseLabel(expense.type)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{expense.date}</TableCell>
                              <TableCell>{expense.description}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(expense.value)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setExpenseToDelete(expense);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma despesa ao diário de bordo desta viagem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Despesa *</Label>
              <Select 
                value={newExpense.type} 
                onValueChange={(v) => setNewExpense({ ...newExpense, type: v })}
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
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.value}
                  onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva a despesa..."
                rows={3}
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExpense} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Expense Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A despesa será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteExpense} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
