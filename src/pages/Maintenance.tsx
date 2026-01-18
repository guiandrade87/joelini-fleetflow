import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Calendar,
  DollarSign,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Maintenance {
  id: string;
  vehicle_id: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  type: "preventiva" | "corretiva";
  description: string;
  supplier?: string;
  estimated_cost?: number;
  actual_cost?: number;
  scheduled_date: string;
  start_date?: string;
  completion_date?: string;
  next_maintenance_date?: string;
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
}

const getStatusBadge = (status: Maintenance["status"]) => {
  switch (status) {
    case "agendada":
      return <Badge className="bg-warning/10 text-warning border-0">Agendada</Badge>;
    case "em_andamento":
      return <Badge className="bg-primary/10 text-primary border-0">Em Execução</Badge>;
    case "concluida":
      return <Badge className="bg-success/10 text-success border-0">Concluída</Badge>;
    case "cancelada":
      return <Badge className="bg-destructive/10 text-destructive border-0">Cancelada</Badge>;
  }
};

const getTipoBadge = (tipo: Maintenance["type"]) => {
  return tipo === "preventiva" ? (
    <Badge variant="secondary">Preventiva</Badge>
  ) : (
    <Badge className="bg-destructive/10 text-destructive border-0">Corretiva</Badge>
  );
};

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  
  // Form states
  const [formVehicle, setFormVehicle] = useState("");
  const [formTipo, setFormTipo] = useState<"preventiva" | "corretiva">("preventiva");
  const [formDescricao, setFormDescricao] = useState("");
  const [formFornecedor, setFormFornecedor] = useState("");
  const [formCusto, setFormCusto] = useState("");
  const [formDataExec, setFormDataExec] = useState("");
  const [formProximaData, setFormProximaData] = useState("");
  const [formActualCost, setFormActualCost] = useState("");
  const [formCompletionKm, setFormCompletionKm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceRes, vehiclesRes] = await Promise.all([
        api.getMaintenances({ 
          page, 
          limit: 10,
          status: statusFilter !== "todos" ? statusFilter : undefined 
        }),
        api.getVehicles({ limit: 100 })
      ]);
      setMaintenances(maintenanceRes.data);
      setTotalPages(Math.ceil(maintenanceRes.pagination.total / 10));
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormVehicle("");
    setFormTipo("preventiva");
    setFormDescricao("");
    setFormFornecedor("");
    setFormCusto("");
    setFormDataExec("");
    setFormProximaData("");
    setFormActualCost("");
    setFormCompletionKm("");
  };

  const filteredMaintenances = maintenances.filter((m) => {
    const matchesSearch =
      (m.vehicle_model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (m.vehicle_plate?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalCusto = maintenances.reduce((acc, m) => acc + (m.actual_cost || m.estimated_cost || 0), 0);
  const agendadas = maintenances.filter((m) => m.status === "agendada").length;
  const emExecucao = maintenances.filter((m) => m.status === "em_andamento").length;
  const concluidas = maintenances.filter((m) => m.status === "concluida").length;

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleAdd = async () => {
    if (!formVehicle || !formDescricao || !formDataExec) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await api.createMaintenance({
        vehicle_id: formVehicle,
        type: formTipo,
        description: formDescricao,
        supplier: formFornecedor || undefined,
        estimated_cost: formCusto ? parseFloat(formCusto) : undefined,
        scheduled_date: formDataExec,
        next_maintenance_date: formProximaData || undefined,
      });
      
      await loadData();
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Manutenção agendada",
        description: "A manutenção foi agendada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao agendar manutenção.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedMaintenance || !formVehicle || !formDescricao || !formDataExec) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await api.updateMaintenance(selectedMaintenance.id, {
        vehicle_id: formVehicle,
        type: formTipo,
        description: formDescricao,
        supplier: formFornecedor || undefined,
        estimated_cost: formCusto ? parseFloat(formCusto) : undefined,
        scheduled_date: formDataExec,
        next_maintenance_date: formProximaData || undefined,
      });

      await loadData();
      setIsEditDialogOpen(false);
      setSelectedMaintenance(null);
      resetForm();
      toast({
        title: "Manutenção atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar manutenção.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaintenance) return;
    
    try {
      setSaving(true);
      await api.deleteMaintenance(selectedMaintenance.id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedMaintenance(null);
      toast({
        title: "Manutenção excluída",
        description: "O registro foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir manutenção.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartMaintenance = async (id: string) => {
    try {
      await api.startMaintenance(id);
      await loadData();
      toast({
        title: "Status atualizado",
        description: "A manutenção foi iniciada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar manutenção.",
        variant: "destructive",
      });
    }
  };

  const handleFinishMaintenance = async () => {
    if (!selectedMaintenance) return;

    try {
      setSaving(true);
      await api.finishMaintenance(selectedMaintenance.id, {
        actual_cost: formActualCost ? parseFloat(formActualCost) : undefined,
        completion_km: formCompletionKm ? parseInt(formCompletionKm) : undefined,
      });
      await loadData();
      setIsFinishDialogOpen(false);
      setSelectedMaintenance(null);
      resetForm();
      toast({
        title: "Status atualizado",
        description: "A manutenção foi concluída.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao concluir manutenção.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setFormVehicle(maintenance.vehicle_id);
    setFormTipo(maintenance.type);
    setFormDescricao(maintenance.description);
    setFormFornecedor(maintenance.supplier || "");
    setFormCusto(String(maintenance.estimated_cost || ""));
    setFormDataExec(formatDateForInput(maintenance.scheduled_date));
    setFormProximaData(maintenance.next_maintenance_date ? formatDateForInput(maintenance.next_maintenance_date) : "");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDeleteDialogOpen(true);
  };

  const openFinishDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setFormActualCost(String(maintenance.actual_cost || maintenance.estimated_cost || ""));
    setFormCompletionKm("");
    setIsFinishDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR");
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
            <h2 className="text-2xl font-bold text-foreground">Manutenção</h2>
            <p className="text-muted-foreground">
              Controle de manutenções preventivas e corretivas
            </p>
          </div>
          <Button className="btn-primary-glow" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agendar Manutenção
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total (Mês)</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalCusto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-warning">{agendadas}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold text-primary">{emExecucao}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas (Mês)</p>
                <p className="text-2xl font-bold text-success">{concluidas}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{maintenances.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Wrench className="h-5 w-5 text-accent-foreground" />
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
                placeholder="Buscar por veículo, placa ou descrição..."
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
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em_andamento">Em Execução</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
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
                <TableHead>Veículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma manutenção encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaintenances.map((maintenance) => (
                  <TableRow key={maintenance.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{maintenance.vehicle_model || "Veículo"}</p>
                          <p className="text-sm text-muted-foreground">{maintenance.vehicle_plate}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(maintenance.type)}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm text-foreground truncate">{maintenance.description}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {maintenance.supplier || "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{formatDate(maintenance.scheduled_date)}</p>
                        {maintenance.next_maintenance_date && (
                          <p className="text-xs text-muted-foreground">
                            Próx: {formatDate(maintenance.next_maintenance_date)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      R$ {(maintenance.actual_cost || maintenance.estimated_cost || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(maintenance)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {maintenance.status === "agendada" && (
                            <DropdownMenuItem onClick={() => handleStartMaintenance(maintenance.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar Execução
                            </DropdownMenuItem>
                          )}
                          {maintenance.status === "em_andamento" && (
                            <DropdownMenuItem onClick={() => openFinishDialog(maintenance)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marcar Concluída
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(maintenance)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agendar Manutenção</DialogTitle>
            <DialogDescription>
              Preencha os dados da manutenção a ser realizada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo *</Label>
                <Select value={formVehicle} onValueChange={setFormVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.brand} {v.model} - {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formTipo} onValueChange={(v) => setFormTipo(v as "preventiva" | "corretiva")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="corretiva">Corretiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea 
                id="descricao" 
                placeholder="Descreva o serviço..." 
                rows={2}
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input 
                  id="fornecedor" 
                  placeholder="Nome do fornecedor"
                  value={formFornecedor}
                  onChange={(e) => setFormFornecedor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo">Custo Estimado (R$)</Label>
                <Input 
                  id="custo" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formCusto}
                  onChange={(e) => setFormCusto(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataExec">Data Agendada *</Label>
                <Input 
                  id="dataExec" 
                  type="date"
                  value={formDataExec}
                  onChange={(e) => setFormDataExec(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proximaData">Próxima Manutenção</Label>
                <Input 
                  id="proximaData" 
                  type="date"
                  value={formProximaData}
                  onChange={(e) => setFormProximaData(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setSelectedMaintenance(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Manutenção</DialogTitle>
            <DialogDescription>
              Altere os dados da manutenção.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo *</Label>
                <Select value={formVehicle} onValueChange={setFormVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.brand} {v.model} - {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formTipo} onValueChange={(v) => setFormTipo(v as "preventiva" | "corretiva")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="corretiva">Corretiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea 
                id="descricao" 
                placeholder="Descreva o serviço..." 
                rows={2}
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input 
                  id="fornecedor" 
                  placeholder="Nome do fornecedor"
                  value={formFornecedor}
                  onChange={(e) => setFormFornecedor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo">Custo (R$)</Label>
                <Input 
                  id="custo" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formCusto}
                  onChange={(e) => setFormCusto(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataExec">Data *</Label>
                <Input 
                  id="dataExec" 
                  type="date"
                  value={formDataExec}
                  onChange={(e) => setFormDataExec(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proximaData">Próxima Manutenção</Label>
                <Input 
                  id="proximaData" 
                  type="date"
                  value={formProximaData}
                  onChange={(e) => setFormProximaData(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedMaintenance(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Dialog */}
      <Dialog open={isFinishDialogOpen} onOpenChange={(open) => { setIsFinishDialogOpen(open); if (!open) { setSelectedMaintenance(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Concluir Manutenção</DialogTitle>
            <DialogDescription>
              Informe os dados de conclusão da manutenção.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actualCost">Custo Final (R$)</Label>
              <Input 
                id="actualCost" 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                value={formActualCost}
                onChange={(e) => setFormActualCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completionKm">KM na Conclusão</Label>
              <Input 
                id="completionKm" 
                type="number" 
                placeholder="0"
                value={formCompletionKm}
                onChange={(e) => setFormCompletionKm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsFinishDialogOpen(false); setSelectedMaintenance(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleFinishMaintenance} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir manutenção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro de manutenção será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMaintenance(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
