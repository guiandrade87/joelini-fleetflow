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
  Fuel,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

interface Fueling {
  id: string;
  vehicle: string;
  plate: string;
  driver: string;
  date: string;
  km: number;
  litros: number;
  valorTotal: number;
  posto: string;
  tipoCombustivel: string;
}

const mockFuelings: Fueling[] = [
  {
    id: "1",
    vehicle: "Fiat Strada",
    plate: "ABC-1234",
    driver: "João Silva",
    date: "11/12/2024",
    km: 45230,
    litros: 45.5,
    valorTotal: 273.0,
    posto: "Posto Shell Centro",
    tipoCombustivel: "Gasolina",
  },
  {
    id: "2",
    vehicle: "VW Saveiro",
    plate: "DEF-5678",
    driver: "Carlos Oliveira",
    date: "10/12/2024",
    km: 62100,
    litros: 38.2,
    valorTotal: 228.92,
    posto: "Posto Ipiranga Rod",
    tipoCombustivel: "Gasolina",
  },
  {
    id: "3",
    vehicle: "Fiat Ducato",
    plate: "GHI-9012",
    driver: "Maria Santos",
    date: "09/12/2024",
    km: 89450,
    litros: 62.0,
    valorTotal: 347.0,
    posto: "Posto BR Matriz",
    tipoCombustivel: "Diesel S10",
  },
  {
    id: "4",
    vehicle: "Renault Master",
    plate: "JKL-3456",
    driver: "Pedro Costa",
    date: "08/12/2024",
    km: 23100,
    litros: 58.5,
    valorTotal: 327.6,
    posto: "Posto Shell Centro",
    tipoCombustivel: "Diesel S10",
  },
  {
    id: "5",
    vehicle: "Fiat Toro",
    plate: "MNO-7890",
    driver: "Ana Rodrigues",
    date: "07/12/2024",
    km: 38920,
    litros: 52.0,
    valorTotal: 291.2,
    posto: "Posto Ipiranga Rod",
    tipoCombustivel: "Diesel S10",
  },
];

export default function Fuelings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const totalLitros = mockFuelings.reduce((acc, f) => acc + f.litros, 0);
  const totalValor = mockFuelings.reduce((acc, f) => acc + f.valorTotal, 0);
  const precoMedio = totalValor / totalLitros;

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Abastecimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Abastecimento</DialogTitle>
                <DialogDescription>
                  Preencha os dados do abastecimento realizado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="veiculo">Veículo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Fiat Strada - ABC-1234</SelectItem>
                        <SelectItem value="2">VW Saveiro - DEF-5678</SelectItem>
                        <SelectItem value="3">Fiat Ducato - GHI-9012</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motorista">Motorista</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">João Silva</SelectItem>
                        <SelectItem value="2">Maria Santos</SelectItem>
                        <SelectItem value="3">Pedro Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="km">Odômetro (km)</Label>
                    <Input id="km" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="litros">Litros</Label>
                    <Input id="litros" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input id="valor" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combustivel">Combustível</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasolina">Gasolina</SelectItem>
                        <SelectItem value="etanol">Etanol</SelectItem>
                        <SelectItem value="diesel">Diesel S10</SelectItem>
                        <SelectItem value="gnv">GNV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posto">Posto</Label>
                  <Input id="posto" placeholder="Nome do posto" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total do Mês</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                  {totalLitros.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} L
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
                  R$ {precoMedio.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abastecimentos</p>
                <p className="text-2xl font-bold text-foreground">{mockFuelings.length}</p>
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
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="diesel">Diesel S10</SelectItem>
                <SelectItem value="etanol">Etanol</SelectItem>
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
                <TableHead>Motorista</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Odômetro</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Posto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFuelings.map((fueling) => (
                <TableRow key={fueling.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                        <Fuel className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{fueling.vehicle}</p>
                        <p className="text-sm text-muted-foreground">{fueling.plate}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{fueling.driver}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fueling.date}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {fueling.km.toLocaleString()} km
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {fueling.litros.toFixed(1)} L
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    R$ {fueling.valorTotal.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{fueling.posto}</p>
                      <p className="text-xs text-muted-foreground">{fueling.tipoCombustivel}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
