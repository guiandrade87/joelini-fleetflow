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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Maintenance {
  id: string;
  vehicle: string;
  plate: string;
  tipo: "preventiva" | "corretiva";
  descricao: string;
  fornecedor: string;
  custo: number;
  dataExec: string;
  proximaData: string | null;
  status: "agendado" | "em_execucao" | "concluida" | "cancelada";
}

const initialMaintenances: Maintenance[] = [
  {
    id: "1",
    vehicle: "Fiat Ducato",
    plate: "GHI-9012",
    tipo: "preventiva",
    descricao: "Revisão 50.000km completa",
    fornecedor: "Concessionária Fiat",
    custo: 1850.0,
    dataExec: "14/12/2024",
    proximaData: "14/06/2025",
    status: "agendado",
  },
  {
    id: "2",
    vehicle: "VW Saveiro",
    plate: "DEF-5678",
    tipo: "preventiva",
    descricao: "Troca de óleo e filtros",
    fornecedor: "Auto Center Silva",
    custo: 450.0,
    dataExec: "18/12/2024",
    proximaData: "18/03/2025",
    status: "agendado",
  },
  {
    id: "3",
    vehicle: "Fiat Strada",
    plate: "ABC-1234",
    tipo: "corretiva",
    descricao: "Reparo no sistema de freios",
    fornecedor: "Freios Express",
    custo: 780.0,
    dataExec: "08/12/2024",
    proximaData: null,
    status: "concluida",
  },
  {
    id: "4",
    vehicle: "Renault Master",
    plate: "JKL-3456",
    tipo: "preventiva",
    descricao: "Alinhamento e balanceamento",
    fornecedor: "Pneu Mania",
    custo: 320.0,
    dataExec: "20/12/2024",
    proximaData: "20/06/2025",
    status: "agendado",
  },
  {
    id: "5",
    vehicle: "Fiat Toro",
    plate: "MNO-7890",
    tipo: "corretiva",
    descricao: "Substituição da bateria",
    fornecedor: "Baterias Prime",
    custo: 650.0,
    dataExec: "05/12/2024",
    proximaData: null,
    status: "concluida",
  },
];

const mockVehicles = [
  { id: "1", name: "Fiat Strada", plate: "ABC-1234" },
  { id: "2", name: "VW Saveiro", plate: "DEF-5678" },
  { id: "3", name: "Fiat Ducato", plate: "GHI-9012" },
  { id: "4", name: "Renault Master", plate: "JKL-3456" },
  { id: "5", name: "Fiat Toro", plate: "MNO-7890" },
];

const getStatusBadge = (status: Maintenance["status"]) => {
  switch (status) {
    case "agendado":
      return <Badge className="bg-warning/10 text-warning border-0">Agendado</Badge>;
    case "em_execucao":
      return <Badge className="bg-primary/10 text-primary border-0">Em Execução</Badge>;
    case "concluida":
      return <Badge className="bg-success/10 text-success border-0">Concluída</Badge>;
    case "cancelada":
      return <Badge className="bg-destructive/10 text-destructive border-0">Cancelada</Badge>;
  }
};

const getTipoBadge = (tipo: Maintenance["tipo"]) => {
  return tipo === "preventiva" ? (
    <Badge variant="secondary">Preventiva</Badge>
  ) : (
    <Badge className="bg-destructive/10 text-destructive border-0">Corretiva</Badge>
  );
};

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>(initialMaintenances);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  
  // Form states
  const [formVehicle, setFormVehicle] = useState("");
  const [formTipo, setFormTipo] = useState<"preventiva" | "corretiva">("preventiva");
  const [formDescricao, setFormDescricao] = useState("");
  const [formFornecedor, setFormFornecedor] = useState("");
  const [formCusto, setFormCusto] = useState("");
  const [formDataExec, setFormDataExec] = useState("");
  const [formProximaData, setFormProximaData] = useState("");

  const resetForm = () => {
    setFormVehicle("");
    setFormTipo("preventiva");
    setFormDescricao("");
    setFormFornecedor("");
    setFormCusto("");
    setFormDataExec("");
    setFormProximaData("");
  };

  const filteredMaintenances = maintenances.filter((m) => {
    const matchesSearch =
      m.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCusto = maintenances.reduce((acc, m) => acc + m.custo, 0);
  const agendadas = maintenances.filter((m) => m.status === "agendado").length;
  const emExecucao = maintenances.filter((m) => m.status === "em_execucao").length;
  const concluidas = maintenances.filter((m) => m.status === "concluida").length;

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleAdd = () => {
    const vehicle = mockVehicles.find((v) => v.id === formVehicle);
    if (!vehicle || !formDescricao || !formDataExec) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newMaintenance: Maintenance = {
      id: String(Date.now()),
      vehicle: vehicle.name,
      plate: vehicle.plate,
      tipo: formTipo,
      descricao: formDescricao,
      fornecedor: formFornecedor,
      custo: parseFloat(formCusto) || 0,
      dataExec: formatDateForDisplay(formDataExec),
      proximaData: formProximaData ? formatDateForDisplay(formProximaData) : null,
      status: "agendado",
    };

    setMaintenances([newMaintenance, ...maintenances]);
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: "Manutenção agendada",
      description: "A manutenção foi agendada com sucesso.",
    });
  };

  const handleEdit = () => {
    if (!selectedMaintenance) return;
    
    const vehicle = mockVehicles.find((v) => v.id === formVehicle);
    if (!vehicle || !formDescricao || !formDataExec) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setMaintenances(maintenances.map((m) =>
      m.id === selectedMaintenance.id
        ? {
            ...m,
            vehicle: vehicle.name,
            plate: vehicle.plate,
            tipo: formTipo,
            descricao: formDescricao,
            fornecedor: formFornecedor,
            custo: parseFloat(formCusto) || 0,
            dataExec: formatDateForDisplay(formDataExec),
            proximaData: formProximaData ? formatDateForDisplay(formProximaData) : null,
          }
        : m
    ));
    setIsEditDialogOpen(false);
    setSelectedMaintenance(null);
    resetForm();
    toast({
      title: "Manutenção atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = () => {
    if (!selectedMaintenance) return;
    setMaintenances(maintenances.filter((m) => m.id !== selectedMaintenance.id));
    setIsDeleteDialogOpen(false);
    setSelectedMaintenance(null);
    toast({
      title: "Manutenção excluída",
      description: "O registro foi removido com sucesso.",
    });
  };

  const handleStatusChange = (id: string, newStatus: Maintenance["status"]) => {
    setMaintenances(maintenances.map((m) =>
      m.id === id ? { ...m, status: newStatus } : m
    ));
    const statusLabels = {
      agendado: "agendada",
      em_execucao: "iniciada",
      concluida: "concluída",
      cancelada: "cancelada",
    };
    toast({
      title: "Status atualizado",
      description: `A manutenção foi ${statusLabels[newStatus]}.`,
    });
  };

  const openEditDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    const vehicle = mockVehicles.find((v) => v.name === maintenance.vehicle);
    setFormVehicle(vehicle?.id || "");
    setFormTipo(maintenance.tipo);
    setFormDescricao(maintenance.descricao);
    setFormFornecedor(maintenance.fornecedor);
    setFormCusto(String(maintenance.custo));
    setFormDataExec(formatDateForInput(maintenance.dataExec));
    setFormProximaData(maintenance.proximaData ? formatDateForInput(maintenance.proximaData) : "");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDeleteDialogOpen(true);
  };

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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="em_execucao">Em Execução</SelectItem>
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
                          <p className="font-medium text-foreground">{maintenance.vehicle}</p>
                          <p className="text-sm text-muted-foreground">{maintenance.plate}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(maintenance.tipo)}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm text-foreground truncate">{maintenance.descricao}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {maintenance.fornecedor || "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{maintenance.dataExec}</p>
                        {maintenance.proximaData && (
                          <p className="text-xs text-muted-foreground">
                            Próx: {maintenance.proximaData}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      R$ {maintenance.custo.toFixed(2)}
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
                          {maintenance.status === "agendado" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(maintenance.id, "em_execucao")}>
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar Execução
                            </DropdownMenuItem>
                          )}
                          {maintenance.status === "em_execucao" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(maintenance.id, "concluida")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marcar Concluída
                            </DropdownMenuItem>
                          )}
                          {(maintenance.status === "agendado" || maintenance.status === "em_execucao") && (
                            <DropdownMenuItem onClick={() => handleStatusChange(maintenance.id, "cancelada")}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
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
                    {mockVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} - {v.plate}
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
            <Button onClick={handleAdd}>
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
                    {mockVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} - {v.plate}
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
            <Button onClick={handleEdit}>
              Salvar Alterações
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
              Esta ação não pode ser desfeita. O registro de manutenção de "{selectedMaintenance?.vehicle}" será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMaintenance(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
