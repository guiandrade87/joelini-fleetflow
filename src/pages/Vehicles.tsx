import { useState, useEffect, useCallback } from "react";
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
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Car,
  Edit,
  History,
  Wrench,
  Route,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Vehicle {
  id: string;
  plate: string;
  renavam?: string;
  chassis?: string;
  model: string;
  brand: string;
  year: number;
  color?: string;
  fuel_type?: string;
  tank_capacity?: number;
  current_km: number;
  status: "disponivel" | "em_uso" | "manutencao" | "inativo";
  acquisition_date?: string;
  acquisition_value?: number;
  photo_url?: string;
  insurance_policy?: string;
  insurance_expiry?: string;
  ipva_expiry?: string;
  licensing_expiry?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface VehicleFormData {
  plate: string;
  renavam: string;
  chassis: string;
  model: string;
  brand: string;
  year: string;
  color: string;
  fuel_type: string;
  tank_capacity: string;
  current_km: string;
  status: string;
  acquisition_date: string;
  acquisition_value: string;
  notes: string;
}

const initialFormData: VehicleFormData = {
  plate: "",
  renavam: "",
  chassis: "",
  model: "",
  brand: "",
  year: new Date().getFullYear().toString(),
  color: "",
  fuel_type: "gasolina",
  tank_capacity: "",
  current_km: "0",
  status: "disponivel",
  acquisition_date: "",
  acquisition_value: "",
  notes: "",
};

const getStatusBadge = (status: Vehicle["status"]) => {
  switch (status) {
    case "disponivel":
      return (
        <Badge className="bg-success/10 text-success border-0">Disponível</Badge>
      );
    case "em_uso":
      return (
        <Badge className="bg-primary/10 text-primary border-0">Em Uso</Badge>
      );
    case "manutencao":
      return (
        <Badge className="bg-warning/10 text-warning border-0">Manutenção</Badge>
      );
    case "inativo":
      return (
        <Badge className="bg-muted text-muted-foreground border-0">Inativo</Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getFuelTypeLabel = (type?: string) => {
  const types: Record<string, string> = {
    gasolina: "Gasolina",
    etanol: "Etanol",
    diesel: "Diesel",
    flex: "Flex",
    gnv: "GNV",
    eletrico: "Elétrico",
  };
  return types[type || ""] || type || "-";
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter && statusFilter !== "todos") {
        params.status = statusFilter;
      }

      const response = await api.getVehicles(params);
      setVehicles(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      toast.error("Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedVehicle(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      plate: vehicle.plate || "",
      renavam: vehicle.renavam || "",
      chassis: vehicle.chassis || "",
      model: vehicle.model || "",
      brand: vehicle.brand || "",
      year: vehicle.year?.toString() || "",
      color: vehicle.color || "",
      fuel_type: vehicle.fuel_type || "gasolina",
      tank_capacity: vehicle.tank_capacity?.toString() || "",
      current_km: vehicle.current_km?.toString() || "0",
      status: vehicle.status || "disponivel",
      acquisition_date: vehicle.acquisition_date?.split("T")[0] || "",
      acquisition_value: vehicle.acquisition_value?.toString() || "",
      notes: vehicle.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.plate || !formData.model || !formData.brand) {
      toast.error("Preencha os campos obrigatórios: Placa, Modelo e Marca");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plate: formData.plate.toUpperCase(),
        renavam: formData.renavam || null,
        chassis: formData.chassis || null,
        model: formData.model,
        brand: formData.brand,
        year: parseInt(formData.year) || new Date().getFullYear(),
        color: formData.color || null,
        fuel_type: formData.fuel_type || "gasolina",
        tank_capacity: formData.tank_capacity ? parseFloat(formData.tank_capacity) : null,
        current_km: parseInt(formData.current_km) || 0,
        status: formData.status || "disponivel",
        acquisition_date: formData.acquisition_date || null,
        acquisition_value: formData.acquisition_value ? parseFloat(formData.acquisition_value) : null,
        notes: formData.notes || null,
      };

      await api.createVehicle(payload);
      toast.success("Veículo cadastrado com sucesso!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error: any) {
      console.error("Erro ao criar veículo:", error);
      toast.error(error.message || "Erro ao cadastrar veículo");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedVehicle) return;

    if (!formData.plate || !formData.model || !formData.brand) {
      toast.error("Preencha os campos obrigatórios: Placa, Modelo e Marca");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plate: formData.plate.toUpperCase(),
        renavam: formData.renavam || null,
        chassis: formData.chassis || null,
        model: formData.model,
        brand: formData.brand,
        year: parseInt(formData.year) || new Date().getFullYear(),
        color: formData.color || null,
        fuel_type: formData.fuel_type || "gasolina",
        tank_capacity: formData.tank_capacity ? parseFloat(formData.tank_capacity) : null,
        current_km: parseInt(formData.current_km) || 0,
        status: formData.status || "disponivel",
        acquisition_date: formData.acquisition_date || null,
        acquisition_value: formData.acquisition_value ? parseFloat(formData.acquisition_value) : null,
        notes: formData.notes || null,
      };

      await api.updateVehicle(selectedVehicle.id, payload);
      toast.success("Veículo atualizado com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error: any) {
      console.error("Erro ao atualizar veículo:", error);
      toast.error(error.message || "Erro ao atualizar veículo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;

    setSaving(true);
    try {
      await api.deleteVehicle(selectedVehicle.id);
      toast.success("Veículo excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      console.error("Erro ao excluir veículo:", error);
      toast.error(error.message || "Erro ao excluir veículo");
    } finally {
      setSaving(false);
    }
  };

  const VehicleFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plate">Placa *</Label>
          <Input
            id="plate"
            placeholder="ABC-1234"
            value={formData.plate}
            onChange={(e) => handleInputChange("plate", e.target.value.toUpperCase())}
            maxLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="renavam">RENAVAM</Label>
          <Input
            id="renavam"
            placeholder="00000000000"
            value={formData.renavam}
            onChange={(e) => handleInputChange("renavam", e.target.value)}
            maxLength={11}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca *</Label>
          <Input
            id="brand"
            placeholder="Fiat"
            value={formData.brand}
            onChange={(e) => handleInputChange("brand", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo *</Label>
          <Input
            id="model"
            placeholder="Strada"
            value={formData.model}
            onChange={(e) => handleInputChange("model", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            type="number"
            placeholder="2024"
            value={formData.year}
            onChange={(e) => handleInputChange("year", e.target.value)}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            placeholder="Branco"
            value={formData.color}
            onChange={(e) => handleInputChange("color", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuel_type">Combustível</Label>
          <Select
            value={formData.fuel_type}
            onValueChange={(value) => handleInputChange("fuel_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasolina">Gasolina</SelectItem>
              <SelectItem value="etanol">Etanol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
              <SelectItem value="gnv">GNV</SelectItem>
              <SelectItem value="eletrico">Elétrico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current_km">Odômetro (km)</Label>
          <Input
            id="current_km"
            type="number"
            placeholder="0"
            value={formData.current_km}
            onChange={(e) => handleInputChange("current_km", e.target.value)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tank_capacity">Tanque (L)</Label>
          <Input
            id="tank_capacity"
            type="number"
            placeholder="55"
            value={formData.tank_capacity}
            onChange={(e) => handleInputChange("tank_capacity", e.target.value)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Situação</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="em_uso">Em Uso</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chassis">Chassi</Label>
          <Input
            id="chassis"
            placeholder="00000000000000000"
            value={formData.chassis}
            onChange={(e) => handleInputChange("chassis", e.target.value)}
            maxLength={17}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acquisition_date">Data de Aquisição</Label>
          <Input
            id="acquisition_date"
            type="date"
            value={formData.acquisition_date}
            onChange={(e) => handleInputChange("acquisition_date", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="acquisition_value">Valor de Aquisição (R$)</Label>
        <Input
          id="acquisition_value"
          type="number"
          placeholder="0,00"
          value={formData.acquisition_value}
          onChange={(e) => handleInputChange("acquisition_value", e.target.value)}
          min={0}
          step="0.01"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Informações adicionais sobre o veículo..."
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Veículos</h2>
            <p className="text-muted-foreground">
              Gerencie a frota de veículos da empresa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchVehicles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button className="btn-primary-glow" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, modelo ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Situações</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando veículos...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Car className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum veículo encontrado</p>
              <p className="text-sm">Cadastre um novo veículo para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Veículo</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Odômetro</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                          <Car className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.plate} • {vehicle.year}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {getFuelTypeLabel(vehicle.fuel_type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {(vehicle.current_km || 0).toLocaleString("pt-BR")} km
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(vehicle)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(vehicle)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="h-4 w-4 mr-2" />
                            Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Route className="h-4 w-4 mr-2" />
                            Iniciar Viagem
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wrench className="h-4 w-4 mr-2" />
                            Agendar Manutenção
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteDialog(vehicle)}
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

        {/* Pagination info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {vehicles.length} de {pagination.total} veículos
          </p>
          {pagination.pages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Anterior
              </Button>
              <span className="flex items-center px-2">
                Página {pagination.page} de {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>

        {/* Add Vehicle Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
              <DialogDescription>
                Preencha os dados do veículo para adicioná-lo à frota.
              </DialogDescription>
            </DialogHeader>
            <VehicleFormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cadastrar Veículo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Veículo</DialogTitle>
              <DialogDescription>
                Atualize os dados do veículo {selectedVehicle?.plate}.
              </DialogDescription>
            </DialogHeader>
            <VehicleFormFields />
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

        {/* View Vehicle Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Veículo</DialogTitle>
              <DialogDescription>
                Informações completas do veículo {selectedVehicle?.plate}
              </DialogDescription>
            </DialogHeader>
            {selectedVehicle && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="h-16 w-16 rounded-lg bg-accent flex items-center justify-center">
                    <Car className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedVehicle.plate} • {selectedVehicle.year}
                    </p>
                  </div>
                  <div className="ml-auto">{getStatusBadge(selectedVehicle.status)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">RENAVAM</p>
                    <p className="font-medium">{selectedVehicle.renavam || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chassi</p>
                    <p className="font-medium">{selectedVehicle.chassis || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cor</p>
                    <p className="font-medium">{selectedVehicle.color || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível</p>
                    <p className="font-medium">{getFuelTypeLabel(selectedVehicle.fuel_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Odômetro</p>
                    <p className="font-medium">
                      {(selectedVehicle.current_km || 0).toLocaleString("pt-BR")} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade do Tanque</p>
                    <p className="font-medium">
                      {selectedVehicle.tank_capacity ? `${selectedVehicle.tank_capacity} L` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Aquisição</p>
                    <p className="font-medium">
                      {selectedVehicle.acquisition_date
                        ? new Date(selectedVehicle.acquisition_date).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                    <p className="font-medium">
                      {selectedVehicle.acquisition_value
                        ? `R$ ${selectedVehicle.acquisition_value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : "-"}
                    </p>
                  </div>
                </div>
                {selectedVehicle.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-medium">{selectedVehicle.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedVehicle) openEditDialog(selectedVehicle);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o veículo{" "}
                <strong>
                  {selectedVehicle?.brand} {selectedVehicle?.model}
                </strong>{" "}
                (Placa: {selectedVehicle?.plate})?
                <br />
                <br />
                Esta ação não pode ser desfeita.
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
