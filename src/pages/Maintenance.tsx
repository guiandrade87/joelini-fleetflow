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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

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

const mockMaintenances: Maintenance[] = [
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredMaintenances = mockMaintenances.filter((m) => {
    const matchesSearch =
      m.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCusto = mockMaintenances.reduce((acc, m) => acc + m.custo, 0);
  const agendadas = mockMaintenances.filter((m) => m.status === "agendado").length;
  const concluidas = mockMaintenances.filter((m) => m.status === "concluida").length;

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow">
                <Plus className="h-4 w-4 mr-2" />
                Agendar Manutenção
              </Button>
            </DialogTrigger>
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
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select>
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
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" placeholder="Descreva o serviço..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input id="fornecedor" placeholder="Nome do fornecedor" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custo">Custo Estimado (R$)</Label>
                    <Input id="custo" type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataExec">Data Agendada</Label>
                    <Input id="dataExec" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proximaData">Próxima Manutenção</Label>
                    <Input id="proximaData" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Agendar
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
                <p className="text-2xl font-bold text-foreground">{mockMaintenances.length}</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenances.map((maintenance) => (
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
                    {maintenance.fornecedor}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
