import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  cpf: string;
  telefone: string;
  cnhNum: string;
  cnhCategoria: string;
  cnhValidade: string;
  cnhStatus: "valida" | "proxima" | "vencida";
  habilitado: boolean;
  totalViagens: number;
}

const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "João da Silva",
    cpf: "123.456.789-00",
    telefone: "(11) 99999-1111",
    cnhNum: "12345678900",
    cnhCategoria: "D",
    cnhValidade: "15/08/2025",
    cnhStatus: "valida",
    habilitado: true,
    totalViagens: 45,
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    cpf: "234.567.890-11",
    telefone: "(11) 99999-2222",
    cnhNum: "23456789011",
    cnhCategoria: "B",
    cnhValidade: "05/12/2024",
    cnhStatus: "vencida",
    habilitado: false,
    totalViagens: 32,
  },
  {
    id: "3",
    name: "Maria Santos",
    cpf: "345.678.901-22",
    telefone: "(11) 99999-3333",
    cnhNum: "34567890122",
    cnhCategoria: "D",
    cnhValidade: "26/12/2024",
    cnhStatus: "proxima",
    habilitado: true,
    totalViagens: 67,
  },
  {
    id: "4",
    name: "Pedro Costa",
    cpf: "456.789.012-33",
    telefone: "(11) 99999-4444",
    cnhNum: "45678901233",
    cnhCategoria: "E",
    cnhValidade: "20/05/2026",
    cnhStatus: "valida",
    habilitado: true,
    totalViagens: 89,
  },
  {
    id: "5",
    name: "Ana Rodrigues",
    cpf: "567.890.123-44",
    telefone: "(11) 99999-5555",
    cnhNum: "56789012344",
    cnhCategoria: "B",
    cnhValidade: "10/03/2025",
    cnhStatus: "valida",
    habilitado: true,
    totalViagens: 23,
  },
];

const getCnhStatusBadge = (status: Driver["cnhStatus"]) => {
  switch (status) {
    case "valida":
      return (
        <Badge className="bg-success/10 text-success border-0">Válida</Badge>
      );
    case "proxima":
      return (
        <Badge className="bg-warning/10 text-warning border-0">A Vencer</Badge>
      );
    case "vencida":
      return (
        <Badge className="bg-destructive/10 text-destructive border-0">
          Vencida
        </Badge>
      );
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
  const [searchTerm, setSearchTerm] = useState("");
  const [cnhFilter, setCnhFilter] = useState<string>("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredDrivers = mockDrivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cpf.includes(searchTerm);
    const matchesCnh =
      cnhFilter === "todos" || driver.cnhStatus === cnhFilter;
    return matchesSearch && matchesCnh;
  });

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow">
                <Plus className="h-4 w-4 mr-2" />
                Novo Motorista
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Motorista</DialogTitle>
                <DialogDescription>
                  Preencha os dados do motorista para cadastrá-lo no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" placeholder="João da Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="email@joelini.com.br" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnhNum">Número da CNH</Label>
                    <Input id="cnhNum" placeholder="00000000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnhCategoria">Categoria</Label>
                    <Select>
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnhValidade">Validade</Label>
                    <Input id="cnhValidade" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Cadastrar Motorista
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Motoristas</p>
                <p className="text-2xl font-bold text-foreground">{mockDrivers.length}</p>
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
                <p className="text-2xl font-bold text-warning">
                  {mockDrivers.filter((d) => d.cnhStatus === "proxima").length}
                </p>
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
                <p className="text-2xl font-bold text-destructive">
                  {mockDrivers.filter((d) => d.cnhStatus === "vencida").length}
                </p>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Motorista</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CNH</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Viagens</TableHead>
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
                        <p className="font-medium text-foreground">
                          {driver.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {driver.cpf}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {driver.telefone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {driver.cnhCategoria}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {driver.cnhNum}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {driver.cnhValidade}
                    </span>
                  </TableCell>
                  <TableCell>{getCnhStatusBadge(driver.cnhStatus)}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-foreground">
                      {driver.totalViagens}
                    </span>
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
                        <DropdownMenuItem>
                          <History className="h-4 w-4 mr-2" />
                          Ver Histórico
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver CNH
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
        </div>

        {/* Pagination info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredDrivers.length} de {mockDrivers.length} motoristas
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
