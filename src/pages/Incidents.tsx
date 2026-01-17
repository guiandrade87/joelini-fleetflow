import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  DollarSign,
  Car,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Incident {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  type: "multa" | "sinistro" | "acidente" | "roubo" | "outros";
  description: string;
  date: string;
  location?: string;
  value?: number;
  status: "aberto" | "em_analise" | "resolvido" | "contestado";
  severity?: "baixa" | "media" | "alta" | "critica";
  resolution_notes?: string;
  resolved_at?: string;
  created_at?: string;
  // Joined
  vehicle?: { plate: string; model: string; brand: string };
  driver?: { name: string };
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
}

interface Driver {
  id: string;
  name: string;
}

interface IncidentFormData {
  vehicle_id: string;
  driver_id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  value: string;
  status: string;
  severity: string;
}

const initialFormData: IncidentFormData = {
  vehicle_id: "",
  driver_id: "",
  type: "multa",
  description: "",
  date: new Date().toISOString().split("T")[0],
  location: "",
  value: "",
  status: "aberto",
  severity: "media",
};

const statusColors: Record<string, string> = {
  aberto: "bg-warning/20 text-warning",
  em_analise: "bg-primary/20 text-primary",
  resolvido: "bg-success/20 text-success",
  contestado: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_analise: "Em Análise",
  resolvido: "Resolvido",
  contestado: "Contestado",
};

const typeColors: Record<string, string> = {
  multa: "bg-warning/20 text-warning border-warning",
  sinistro: "bg-destructive/20 text-destructive border-destructive",
  acidente: "bg-destructive/20 text-destructive border-destructive",
  roubo: "bg-destructive/20 text-destructive border-destructive",
  outros: "bg-muted text-muted-foreground",
};

const typeLabels: Record<string, string> = {
  multa: "Multa",
  sinistro: "Sinistro",
  acidente: "Acidente",
  roubo: "Roubo",
  outros: "Outros",
};

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<IncidentFormData>(initialFormData);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Stats
  const totalIncidents = incidents.length;
  const totalMultas = incidents.filter((i) => i.type === "multa").length;
  const totalSinistros = incidents.filter((i) => i.type === "sinistro" || i.type === "acidente").length;
  const totalValor = incidents.reduce((sum, i) => sum + (i.value || 0), 0);
  const abertos = incidents.filter((i) => i.status === "aberto" || i.status === "em_analise").length;

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      };

      if (searchTerm) params.search = searchTerm;
      if (filterTipo !== "all") params.type = filterTipo;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await api.getIncidents(params);
      setIncidents(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterTipo, filterStatus]);

  const fetchVehiclesAndDrivers = useCallback(async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        api.getVehicles({ limit: "100" }),
        api.getDrivers({ limit: "100" }),
      ]);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar veículos/motoristas:", error);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchVehiclesAndDrivers();
  }, [fetchIncidents, fetchVehiclesAndDrivers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterTipo, filterStatus]);

  const handleInputChange = (field: keyof IncidentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedIncident(null);
    setResolutionNotes("");
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setFormData({
      vehicle_id: incident.vehicle_id || "",
      driver_id: incident.driver_id || "",
      type: incident.type || "multa",
      description: incident.description || "",
      date: incident.date?.split("T")[0] || "",
      location: incident.location || "",
      value: incident.value?.toString() || "",
      status: incident.status || "aberto",
      severity: incident.severity || "media",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDeleteDialogOpen(true);
  };

  const openResolveDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setResolutionNotes("");
    setIsResolveDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.vehicle_id || !formData.type || !formData.description || !formData.date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        location: formData.location || null,
        value: formData.value ? parseFloat(formData.value) : null,
        status: formData.status || "aberto",
        severity: formData.severity || "media",
      };

      await api.createIncident(payload);
      toast.success("Ocorrência registrada com sucesso!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchIncidents();
    } catch (error: any) {
      console.error("Erro ao criar ocorrência:", error);
      toast.error(error.message || "Erro ao registrar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedIncident) return;

    setSaving(true);
    try {
      const payload = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        location: formData.location || null,
        value: formData.value ? parseFloat(formData.value) : null,
        status: formData.status || "aberto",
        severity: formData.severity || "media",
      };

      await api.updateIncident(selectedIncident.id, payload);
      toast.success("Ocorrência atualizada com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
      fetchIncidents();
    } catch (error: any) {
      console.error("Erro ao atualizar ocorrência:", error);
      toast.error(error.message || "Erro ao atualizar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedIncident) return;

    setSaving(true);
    try {
      await api.deleteIncident(selectedIncident.id);
      toast.success("Ocorrência excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedIncident(null);
      fetchIncidents();
    } catch (error: any) {
      console.error("Erro ao excluir ocorrência:", error);
      toast.error(error.message || "Erro ao excluir ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;

    setSaving(true);
    try {
      await api.resolveIncident(selectedIncident.id, { resolution_notes: resolutionNotes });
      toast.success("Ocorrência resolvida com sucesso!");
      setIsResolveDialogOpen(false);
      resetForm();
      fetchIncidents();
    } catch (error: any) {
      console.error("Erro ao resolver ocorrência:", error);
      toast.error(error.message || "Erro ao resolver ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const IncidentFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select value={formData.type} onValueChange={(v) => handleInputChange("type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multa">Multa</SelectItem>
              <SelectItem value="sinistro">Sinistro</SelectItem>
              <SelectItem value="acidente">Acidente</SelectItem>
              <SelectItem value="roubo">Roubo</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Data *</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Veículo *</Label>
          <Select value={formData.vehicle_id} onValueChange={(v) => handleInputChange("vehicle_id", v)}>
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
          <Label>Motorista</Label>
          <Select value={formData.driver_id} onValueChange={(v) => handleInputChange("driver_id", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
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
          <Label>Valor (R$)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.value}
            onChange={(e) => handleInputChange("value", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Severidade</Label>
          <Select value={formData.severity} onValueChange={(v) => handleInputChange("severity", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Local</Label>
        <Input
          placeholder="Local da ocorrência"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Descrição *</Label>
        <Textarea
          placeholder="Descreva a ocorrência..."
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ocorrências</p>
                  <p className="text-2xl font-bold">{totalIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Multas</p>
                  <p className="text-2xl font-bold">{totalMultas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Car className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sinistros/Acidentes</p>
                  <p className="text-2xl font-bold">{totalSinistros}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">
                    {totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold">
                Ocorrências ({abertos} pendentes)
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchIncidents} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Ocorrência
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por veículo, placa, motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="multa">Multas</SelectItem>
                    <SelectItem value="sinistro">Sinistros</SelectItem>
                    <SelectItem value="acidente">Acidentes</SelectItem>
                    <SelectItem value="roubo">Roubos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="contestado">Contestado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando ocorrências...</span>
                </div>
              ) : incidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma ocorrência encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <Badge variant="outline" className={typeColors[incident.type]}>
                            {typeLabels[incident.type] || incident.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(incident.date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {incident.vehicle?.brand} {incident.vehicle?.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {incident.vehicle?.plate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{incident.driver?.name || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {incident.description}
                        </TableCell>
                        <TableCell className="font-medium">
                          {incident.value
                            ? incident.value.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[incident.status]}>
                            {statusLabels[incident.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(incident)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(incident)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {incident.status !== "resolvido" && (
                                <DropdownMenuItem onClick={() => openResolveDialog(incident)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolver
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteDialog(incident)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
              <DialogDescription>Preencha os dados da ocorrência.</DialogDescription>
            </DialogHeader>
            <IncidentFormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Ocorrência</DialogTitle>
            </DialogHeader>
            <IncidentFormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Ocorrência</DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={typeColors[selectedIncident.type]}>
                    {typeLabels[selectedIncident.type]}
                  </Badge>
                  <Badge className={statusColors[selectedIncident.status]}>
                    {statusLabels[selectedIncident.status]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {new Date(selectedIncident.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="font-medium">
                      {selectedIncident.value
                        ? selectedIncident.value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium">
                      {selectedIncident.vehicle?.brand} {selectedIncident.vehicle?.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedIncident.vehicle?.plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motorista</p>
                    <p className="font-medium">{selectedIncident.driver?.name || "-"}</p>
                  </div>
                </div>
                {selectedIncident.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{selectedIncident.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{selectedIncident.description}</p>
                </div>
                {selectedIncident.resolution_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Resolução</p>
                    <p className="font-medium">{selectedIncident.resolution_notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolver Ocorrência</DialogTitle>
              <DialogDescription>
                Adicione uma nota sobre a resolução desta ocorrência.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Notas de Resolução</Label>
              <Textarea
                placeholder="Descreva como a ocorrência foi resolvida..."
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleResolve} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Marcar como Resolvido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Ocorrência</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={saving}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
