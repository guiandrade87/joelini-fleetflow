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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  History,
  FileText,
  AlertTriangle,
  Trash2,
  Calendar,
  Phone,
  RefreshCw,
  Loader2,
  Eye,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Driver {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  address?: string;
  cnh_number: string;
  cnh_category: string;
  cnh_expiry: string;
  cnh_first_license?: string;
  status: "active" | "inactive" | "suspended";
  photo_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface DriverFormData {
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  cnh_number: string;
  cnh_category: string;
  cnh_expiry: string;
  cnh_first_license: string;
  status: string;
  notes: string;
}

const initialFormData: DriverFormData = {
  name: "",
  cpf: "",
  rg: "",
  birth_date: "",
  phone: "",
  email: "",
  address: "",
  cnh_number: "",
  cnh_category: "B",
  cnh_expiry: "",
  cnh_first_license: "",
  status: "active",
  notes: "",
};

const getCnhStatus = (expiryDate: string): "valida" | "proxima" | "vencida" => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "vencida";
  if (diffDays <= 30) return "proxima";
  return "valida";
};

const getCnhStatusBadge = (expiryDate: string) => {
  const status = getCnhStatus(expiryDate);
  switch (status) {
    case "valida":
      return <Badge className="bg-success/10 text-success border-0">Válida</Badge>;
    case "proxima":
      return <Badge className="bg-warning/10 text-warning border-0">A Vencer</Badge>;
    case "vencida":
      return <Badge className="bg-destructive/10 text-destructive border-0">Vencida</Badge>;
  }
};

const getStatusBadge = (status: Driver["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-0">Ativo</Badge>;
    case "inactive":
      return <Badge className="bg-muted text-muted-foreground border-0">Inativo</Badge>;
    case "suspended":
      return <Badge className="bg-destructive/10 text-destructive border-0">Suspenso</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cnhFilter, setCnhFilter] = useState<string>("todos");
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
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);

  // Fetch drivers from API
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.getDrivers(params);
      setDrivers(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
      toast.error("Erro ao carregar motoristas");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleInputChange = (field: keyof DriverFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedDriver(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name || "",
      cpf: driver.cpf || "",
      rg: driver.rg || "",
      birth_date: driver.birth_date?.split("T")[0] || "",
      phone: driver.phone || "",
      email: driver.email || "",
      address: driver.address || "",
      cnh_number: driver.cnh_number || "",
      cnh_category: driver.cnh_category || "B",
      cnh_expiry: driver.cnh_expiry?.split("T")[0] || "",
      cnh_first_license: driver.cnh_first_license?.split("T")[0] || "",
      status: driver.status || "active",
      notes: driver.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.cpf || !formData.cnh_number || !formData.cnh_expiry) {
      toast.error("Preencha os campos obrigatórios: Nome, CPF, Número CNH e Validade CNH");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        cpf: formData.cpf,
        rg: formData.rg || null,
        birth_date: formData.birth_date || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        cnh_number: formData.cnh_number,
        cnh_category: formData.cnh_category,
        cnh_expiry: formData.cnh_expiry,
        cnh_first_license: formData.cnh_first_license || null,
        status: formData.status || "active",
        notes: formData.notes || null,
      };

      await api.createDriver(payload);
      toast.success("Motorista cadastrado com sucesso!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchDrivers();
    } catch (error: any) {
      console.error("Erro ao criar motorista:", error);
      toast.error(error.message || "Erro ao cadastrar motorista");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDriver) return;

    if (!formData.name || !formData.cpf || !formData.cnh_number || !formData.cnh_expiry) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        cpf: formData.cpf,
        rg: formData.rg || null,
        birth_date: formData.birth_date || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        cnh_number: formData.cnh_number,
        cnh_category: formData.cnh_category,
        cnh_expiry: formData.cnh_expiry,
        cnh_first_license: formData.cnh_first_license || null,
        status: formData.status || "active",
        notes: formData.notes || null,
      };

      await api.updateDriver(selectedDriver.id, payload);
      toast.success("Motorista atualizado com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
      fetchDrivers();
    } catch (error: any) {
      console.error("Erro ao atualizar motorista:", error);
      toast.error(error.message || "Erro ao atualizar motorista");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDriver) return;

    setSaving(true);
    try {
      await api.deleteDriver(selectedDriver.id);
      toast.success("Motorista excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error: any) {
      console.error("Erro ao excluir motorista:", error);
      toast.error(error.message || "Erro ao excluir motorista");
    } finally {
      setSaving(false);
    }
  };

  // Filter drivers by CNH status
  const filteredDrivers = drivers.filter((driver) => {
    if (cnhFilter === "todos") return true;
    const status = getCnhStatus(driver.cnh_expiry);
    return status === cnhFilter;
  });

  // Stats
  const totalDrivers = drivers.length;
  const cnhAVencer = drivers.filter((d) => getCnhStatus(d.cnh_expiry) === "proxima").length;
  const cnhVencidas = drivers.filter((d) => getCnhStatus(d.cnh_expiry) === "vencida").length;

  const DriverFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            placeholder="João da Silva"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => handleInputChange("cpf", e.target.value)}
            maxLength={14}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            placeholder="00.000.000-0"
            value={formData.rg}
            onChange={(e) => handleInputChange("rg", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleInputChange("birth_date", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@joelini.com.br"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          placeholder="Rua, número, bairro, cidade - UF"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnh_number">Número CNH *</Label>
          <Input
            id="cnh_number"
            placeholder="00000000000"
            value={formData.cnh_number}
            onChange={(e) => handleInputChange("cnh_number", e.target.value)}
            maxLength={11}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnh_category">Categoria *</Label>
          <Select
            value={formData.cnh_category}
            onValueChange={(value) => handleInputChange("cnh_category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="E">E</SelectItem>
              <SelectItem value="AB">AB</SelectItem>
              <SelectItem value="AC">AC</SelectItem>
              <SelectItem value="AD">AD</SelectItem>
              <SelectItem value="AE">AE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnh_expiry">Validade CNH *</Label>
          <Input
            id="cnh_expiry"
            type="date"
            value={formData.cnh_expiry}
            onChange={(e) => handleInputChange("cnh_expiry", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnh_first_license">Primeira Habilitação</Label>
          <Input
            id="cnh_first_license"
            type="date"
            value={formData.cnh_first_license}
            onChange={(e) => handleInputChange("cnh_first_license", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Informações adicionais sobre o motorista..."
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
            <h2 className="text-2xl font-bold text-foreground">Motoristas</h2>
            <p className="text-muted-foreground">
              Gerencie os motoristas cadastrados no sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDrivers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button className="btn-primary-glow" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Motorista
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Motoristas</p>
                <p className="text-2xl font-bold text-foreground">{totalDrivers}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CNH a Vencer</p>
                <p className="text-2xl font-bold text-warning">{cnhAVencer}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CNH Vencidas</p>
                <p className="text-2xl font-bold text-destructive">{cnhVencidas}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
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
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cnhFilter} onValueChange={setCnhFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status CNH" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="valida">CNH Válida</SelectItem>
                <SelectItem value="proxima">CNH a Vencer</SelectItem>
                <SelectItem value="vencida">CNH Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando motoristas...</span>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum motorista encontrado</p>
              <p className="text-sm">Cadastre um novo motorista para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Motorista</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status CNH</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(driver.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.cpf}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {driver.phone || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {driver.cnh_category}
                        </p>
                        <p className="text-xs text-muted-foreground">{driver.cnh_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {driver.cnh_expiry
                          ? new Date(driver.cnh_expiry).toLocaleDateString("pt-BR")
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>{getCnhStatusBadge(driver.cnh_expiry)}</TableCell>
                    <TableCell>{getStatusBadge(driver.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(driver)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(driver)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="h-4 w-4 mr-2" />
                            Ver Histórico
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver CNH
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openDeleteDialog(driver)}
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
            Mostrando {filteredDrivers.length} de {pagination.total} motoristas
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

        {/* Add Driver Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Motorista</DialogTitle>
              <DialogDescription>
                Preencha os dados do motorista para cadastrá-lo no sistema.
              </DialogDescription>
            </DialogHeader>
            <DriverFormFields />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cadastrar Motorista
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Driver Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Motorista</DialogTitle>
              <DialogDescription>
                Atualize os dados do motorista {selectedDriver?.name}.
              </DialogDescription>
            </DialogHeader>
            <DriverFormFields />
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

        {/* View Driver Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Motorista</DialogTitle>
              <DialogDescription>
                Informações completas do motorista
              </DialogDescription>
            </DialogHeader>
            {selectedDriver && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                      {getInitials(selectedDriver.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedDriver.name}</h3>
                    <p className="text-muted-foreground">{selectedDriver.cpf}</p>
                  </div>
                  <div className="ml-auto">{getStatusBadge(selectedDriver.status)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedDriver.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedDriver.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RG</p>
                    <p className="font-medium">{selectedDriver.rg || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">
                      {selectedDriver.birth_date
                        ? new Date(selectedDriver.birth_date).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Dados da CNH</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Número</p>
                      <p className="font-medium">{selectedDriver.cnh_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <p className="font-medium">{selectedDriver.cnh_category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Validade</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {new Date(selectedDriver.cnh_expiry).toLocaleDateString("pt-BR")}
                        </p>
                        {getCnhStatusBadge(selectedDriver.cnh_expiry)}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedDriver.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{selectedDriver.address}</p>
                  </div>
                )}
                {selectedDriver.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-medium">{selectedDriver.notes}</p>
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
                  if (selectedDriver) openEditDialog(selectedDriver);
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
              <AlertDialogTitle>Excluir Motorista</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o motorista{" "}
                <strong>{selectedDriver?.name}</strong>?
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
