import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Fuel,
  Receipt,
  DollarSign,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Fueling {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  date: string;
  km: number;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  fuel_type: string;
  station?: string;
  receipt_url?: string;
  notes?: string;
  created_at?: string;
  // Joined data
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

interface FuelingFormData {
  vehicle_id: string;
  driver_id: string;
  date: string;
  km: string;
  liters: string;
  price_per_liter: string;
  fuel_type: string;
  station: string;
  notes: string;
}

const initialFormData: FuelingFormData = {
  vehicle_id: "",
  driver_id: "",
  date: new Date().toISOString().split("T")[0],
  km: "",
  liters: "",
  price_per_liter: "",
  fuel_type: "gasolina",
  station: "",
  notes: "",
};

export default function Fuelings() {
  const [fuelings, setFuelings] = useState<Fueling[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fuelFilter, setFuelFilter] = useState<string>("todos");
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
  const [selectedFueling, setSelectedFueling] = useState<Fueling | null>(null);
  const [formData, setFormData] = useState<FuelingFormData>(initialFormData);

  // Stats
  const [stats, setStats] = useState({
    totalCost: 0,
    totalLiters: 0,
    avgPricePerLiter: 0,
    count: 0,
  });

  // Fetch data
  const fetchFuelings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      };

      if (searchTerm) params.search = searchTerm;
      if (fuelFilter && fuelFilter !== "todos") params.fuel_type = fuelFilter;

      const response = await api.getFuelings(params);
      setFuelings(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));

      // Get stats
      const statsData = await api.getFuelingStats();
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar abastecimentos:", error);
      toast.error("Erro ao carregar abastecimentos");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, fuelFilter]);

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
    fetchFuelings();
    fetchVehiclesAndDrivers();
  }, [fetchFuelings, fetchVehiclesAndDrivers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fuelFilter]);

  const handleInputChange = (field: keyof FuelingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedFueling(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (fueling: Fueling) => {
    setSelectedFueling(fueling);
    setFormData({
      vehicle_id: fueling.vehicle_id || "",
      driver_id: fueling.driver_id || "",
      date: fueling.date?.split("T")[0] || "",
      km: fueling.km?.toString() || "",
      liters: fueling.liters?.toString() || "",
      price_per_liter: fueling.price_per_liter?.toString() || "",
      fuel_type: fueling.fuel_type || "gasolina",
      station: fueling.station || "",
      notes: fueling.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (fueling: Fueling) => {
    setSelectedFueling(fueling);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (fueling: Fueling) => {
    setSelectedFueling(fueling);
    setIsDeleteDialogOpen(true);
  };

  const calculateTotal = () => {
    const liters = parseFloat(formData.liters) || 0;
    const price = parseFloat(formData.price_per_liter) || 0;
    return liters * price;
  };

  const handleCreate = async () => {
    if (!formData.vehicle_id || !formData.date || !formData.liters || !formData.price_per_liter) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        date: formData.date,
        km: formData.km ? parseInt(formData.km) : null,
        liters: parseFloat(formData.liters),
        price_per_liter: parseFloat(formData.price_per_liter),
        total_cost: calculateTotal(),
        fuel_type: formData.fuel_type,
        station: formData.station || null,
        notes: formData.notes || null,
      };

      await api.createFueling(payload);
      toast.success("Abastecimento registrado com sucesso!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchFuelings();
    } catch (error: any) {
      console.error("Erro ao criar abastecimento:", error);
      toast.error(error.message || "Erro ao registrar abastecimento");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFueling) return;

    setSaving(true);
    try {
      const payload = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        date: formData.date,
        km: formData.km ? parseInt(formData.km) : null,
        liters: parseFloat(formData.liters),
        price_per_liter: parseFloat(formData.price_per_liter),
        total_cost: calculateTotal(),
        fuel_type: formData.fuel_type,
        station: formData.station || null,
        notes: formData.notes || null,
      };

      await api.updateFueling(selectedFueling.id, payload);
      toast.success("Abastecimento atualizado com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
      fetchFuelings();
    } catch (error: any) {
      console.error("Erro ao atualizar abastecimento:", error);
      toast.error(error.message || "Erro ao atualizar abastecimento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFueling) return;

    setSaving(true);
    try {
      await api.deleteFueling(selectedFueling.id);
      toast.success("Abastecimento excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedFueling(null);
      fetchFuelings();
    } catch (error: any) {
      console.error("Erro ao excluir abastecimento:", error);
      toast.error(error.message || "Erro ao excluir abastecimento");
    } finally {
      setSaving(false);
    }
  };

  const getFuelTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      gasolina: "Gasolina",
      etanol: "Etanol",
      diesel: "Diesel",
      diesel_s10: "Diesel S10",
      gnv: "GNV",
    };
    return types[type] || type;
  };

  const FuelingFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle_id">Veículo *</Label>
          <Select
            value={formData.vehicle_id}
            onValueChange={(value) => handleInputChange("vehicle_id", value)}
          >
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
          <Label htmlFor="driver_id">Motorista</Label>
          <Select
            value={formData.driver_id}
            onValueChange={(value) => handleInputChange("driver_id", value)}
          >
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
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km">Odômetro (km)</Label>
          <Input
            id="km"
            type="number"
            placeholder="0"
            value={formData.km}
            onChange={(e) => handleInputChange("km", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="liters">Litros *</Label>
          <Input
            id="liters"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.liters}
            onChange={(e) => handleInputChange("liters", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_per_liter">Preço/Litro (R$) *</Label>
          <Input
            id="price_per_liter"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price_per_liter}
            onChange={(e) => handleInputChange("price_per_liter", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuel_type">Combustível *</Label>
          <Select
            value={formData.fuel_type}
            onValueChange={(value) => handleInputChange("fuel_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasolina">Gasolina</SelectItem>
              <SelectItem value="etanol">Etanol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="diesel_s10">Diesel S10</SelectItem>
              <SelectItem value="gnv">GNV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="station">Posto</Label>
        <Input
          id="station"
          placeholder="Nome do posto"
          value={formData.station}
          onChange={(e) => handleInputChange("station", e.target.value)}
        />
      </div>
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Valor Total:</span>
          <span className="text-lg font-bold text-primary">
            R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Abastecimentos</h2>
            <p className="text-muted-foreground">
              Controle de combustível e custos da frota
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchFuelings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button className="btn-primary-glow" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Abastecimento
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total do Período</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {(stats.totalCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                <p className="text-sm text-muted-foreground">Litros Abastecidos</p>
                <p className="text-2xl font-bold text-primary">
                  {(stats.totalLiters || 0).toLocaleString("pt-BR", { minimumFractionDigits: 1 })} L
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Fuel className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preço Médio/L</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {(stats.avgPricePerLiter || 0).toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Fuel className="h-5 w-5 text-success" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abastecimentos</p>
                <p className="text-2xl font-bold text-foreground">{stats.count || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Receipt className="h-5 w-5 text-accent-foreground" />
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
                placeholder="Buscar por veículo, motorista ou posto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="diesel_s10">Diesel S10</SelectItem>
                <SelectItem value="etanol">Etanol</SelectItem>
                <SelectItem value="gnv">GNV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando abastecimentos...</span>
            </div>
          ) : fuelings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Fuel className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum abastecimento encontrado</p>
              <p className="text-sm">Registre um novo abastecimento para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Veículo</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Odômetro</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Posto</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelings.map((fueling) => (
                  <TableRow key={fueling.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                          <Fuel className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {fueling.vehicle?.brand} {fueling.vehicle?.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {fueling.vehicle?.plate}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {fueling.driver?.name || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fueling.date
                        ? new Date(fueling.date).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {fueling.km ? `${fueling.km.toLocaleString("pt-BR")} km` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-0">
                        {fueling.liters?.toFixed(1)} L
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      R$ {fueling.total_cost?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{fueling.station || "-"}</p>
                        <p className="text-xs text-muted-foreground">
                          {getFuelTypeLabel(fueling.fuel_type)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(fueling)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(fueling)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteDialog(fueling)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {fuelings.length} de {pagination.total} abastecimentos
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

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Abastecimento</DialogTitle>
              <DialogDescription>
                Preencha os dados do abastecimento realizado.
              </DialogDescription>
            </DialogHeader>
            <FuelingFormFields />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Abastecimento</DialogTitle>
              <DialogDescription>Atualize os dados do abastecimento.</DialogDescription>
            </DialogHeader>
            <FuelingFormFields />
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

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Abastecimento</DialogTitle>
            </DialogHeader>
            {selectedFueling && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium">
                      {selectedFueling.vehicle?.brand} {selectedFueling.vehicle?.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFueling.vehicle?.plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motorista</p>
                    <p className="font-medium">{selectedFueling.driver?.name || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {new Date(selectedFueling.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Odômetro</p>
                    <p className="font-medium">
                      {selectedFueling.km?.toLocaleString("pt-BR")} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível</p>
                    <p className="font-medium">{getFuelTypeLabel(selectedFueling.fuel_type)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Litros</p>
                    <p className="font-medium">{selectedFueling.liters?.toFixed(2)} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço/L</p>
                    <p className="font-medium">R$ {selectedFueling.price_per_liter?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-bold text-primary">
                      R$ {selectedFueling.total_cost?.toFixed(2)}
                    </p>
                  </div>
                </div>
                {selectedFueling.station && (
                  <div>
                    <p className="text-sm text-muted-foreground">Posto</p>
                    <p className="font-medium">{selectedFueling.station}</p>
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

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Abastecimento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este abastecimento? Esta ação não pode ser desfeita.
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
