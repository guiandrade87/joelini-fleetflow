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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  categoria: string;
  odometro: number;
  situacao: "ativo" | "manutencao" | "inativo";
  centroCusto: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    placa: "ABC-1234",
    modelo: "Strada",
    marca: "Fiat",
    ano: 2022,
    categoria: "Utilitário",
    odometro: 45230,
    situacao: "ativo",
    centroCusto: "Logística",
  },
  {
    id: "2",
    placa: "DEF-5678",
    modelo: "Saveiro",
    marca: "Volkswagen",
    ano: 2021,
    categoria: "Utilitário",
    odometro: 62100,
    situacao: "ativo",
    centroCusto: "Comercial",
  },
  {
    id: "3",
    placa: "GHI-9012",
    modelo: "Ducato",
    marca: "Fiat",
    ano: 2020,
    categoria: "Van",
    odometro: 89450,
    situacao: "manutencao",
    centroCusto: "Entregas",
  },
  {
    id: "4",
    placa: "JKL-3456",
    modelo: "Master",
    marca: "Renault",
    ano: 2023,
    categoria: "Van",
    odometro: 23100,
    situacao: "ativo",
    centroCusto: "Entregas",
  },
  {
    id: "5",
    placa: "MNO-7890",
    modelo: "Toro",
    marca: "Fiat",
    ano: 2022,
    categoria: "Picape",
    odometro: 38920,
    situacao: "ativo",
    centroCusto: "Comercial",
  },
  {
    id: "6",
    placa: "PQR-1234",
    modelo: "HR",
    marca: "Hyundai",
    ano: 2019,
    categoria: "Caminhão Leve",
    odometro: 112340,
    situacao: "inativo",
    centroCusto: "Logística",
  },
];

const getSituacaoBadge = (situacao: Vehicle["situacao"]) => {
  switch (situacao) {
    case "ativo":
      return (
        <Badge className="bg-success/10 text-success border-0">Ativo</Badge>
      );
    case "manutencao":
      return (
        <Badge className="bg-warning/10 text-warning border-0">Manutenção</Badge>
      );
    case "inativo":
      return (
        <Badge className="bg-muted text-muted-foreground border-0">Inativo</Badge>
      );
  }
};

export default function Vehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [situacaoFilter, setSituacaoFilter] = useState<string>("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSituacao =
      situacaoFilter === "todos" || vehicle.situacao === situacaoFilter;
    return matchesSearch && matchesSituacao;
  });

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow">
                <Plus className="h-4 w-4 mr-2" />
                Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
                <DialogDescription>
                  Preencha os dados do veículo para adicioná-lo à frota.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="placa">Placa</Label>
                    <Input id="placa" placeholder="ABC-1234" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renavam">RENAVAM</Label>
                    <Input id="renavam" placeholder="00000000000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input id="marca" placeholder="Fiat" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input id="modelo" placeholder="Strada" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano</Label>
                    <Input id="ano" type="number" placeholder="2024" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilitario">Utilitário</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="picape">Picape</SelectItem>
                        <SelectItem value="caminhao">Caminhão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="odometro">Odômetro (km)</Label>
                    <Input id="odometro" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="centroCusto">Centro de Custo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logistica">Logística</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="entregas">Entregas</SelectItem>
                        <SelectItem value="administrativo">
                          Administrativo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chassi">Chassi</Label>
                    <Input id="chassi" placeholder="00000000000000000" />
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
                  Cadastrar Veículo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Select value={situacaoFilter} onValueChange={setSituacaoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Situações</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Odômetro</TableHead>
                <TableHead>Centro de Custo</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                        <Car className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {vehicle.marca} {vehicle.modelo}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.placa} • {vehicle.ano}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {vehicle.categoria}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-foreground">
                      {vehicle.odometro.toLocaleString()} km
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {vehicle.centroCusto}
                    </span>
                  </TableCell>
                  <TableCell>{getSituacaoBadge(vehicle.situacao)}</TableCell>
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
                          <Route className="h-4 w-4 mr-2" />
                          Iniciar Viagem
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wrench className="h-4 w-4 mr-2" />
                          Agendar Manutenção
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
            Mostrando {filteredVehicles.length} de {mockVehicles.length}{" "}
            veículos
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
