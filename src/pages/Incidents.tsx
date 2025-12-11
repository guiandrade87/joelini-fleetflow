import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Upload,
  Eye,
} from "lucide-react";

interface Incident {
  id: number;
  tipo: "multa" | "sinistro";
  veiculo: string;
  placa: string;
  motorista: string;
  descricao: string;
  valor: number;
  data: string;
  status: "aberto" | "em_analise" | "resolvido" | "contestado";
}

const mockIncidents: Incident[] = [
  {
    id: 1,
    tipo: "multa",
    veiculo: "Fiat Strada",
    placa: "ABC-1234",
    motorista: "Carlos Oliveira",
    descricao: "Excesso de velocidade - 20% acima",
    valor: 195.23,
    data: "2024-01-08",
    status: "aberto",
  },
  {
    id: 2,
    tipo: "sinistro",
    veiculo: "VW Saveiro",
    placa: "DEF-5678",
    motorista: "Maria Santos",
    descricao: "Colisão traseira em estacionamento",
    valor: 3500.00,
    data: "2024-01-05",
    status: "em_analise",
  },
  {
    id: 3,
    tipo: "multa",
    veiculo: "Renault Master",
    placa: "GHI-9012",
    motorista: "José Silva",
    descricao: "Estacionamento irregular",
    valor: 88.38,
    data: "2024-01-03",
    status: "contestado",
  },
  {
    id: 4,
    tipo: "multa",
    veiculo: "Ford Ranger",
    placa: "JKL-3456",
    motorista: "Ana Costa",
    descricao: "Avanço de sinal vermelho",
    valor: 293.47,
    data: "2023-12-28",
    status: "resolvido",
  },
];

const statusColors = {
  aberto: "bg-warning text-warning-foreground",
  em_analise: "bg-primary/20 text-primary",
  resolvido: "bg-success/20 text-success",
  contestado: "bg-destructive/20 text-destructive",
};

const statusLabels = {
  aberto: "Aberto",
  em_analise: "Em Análise",
  resolvido: "Resolvido",
  contestado: "Contestado",
};

const tipoColors = {
  multa: "bg-warning/20 text-warning-foreground border-warning",
  sinistro: "bg-destructive/20 text-destructive border-destructive",
};

export default function Incidents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredIncidents = mockIncidents.filter((incident) => {
    const matchesSearch =
      incident.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "all" || incident.tipo === filterTipo;
    const matchesStatus = filterStatus === "all" || incident.status === filterStatus;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const totalValor = mockIncidents.reduce((sum, i) => sum + i.valor, 0);
  const totalMultas = mockIncidents.filter((i) => i.tipo === "multa").length;
  const totalSinistros = mockIncidents.filter((i) => i.tipo === "sinistro").length;
  const abertos = mockIncidents.filter((i) => i.status === "aberto" || i.status === "em_analise").length;

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
                  <p className="text-2xl font-bold">{mockIncidents.length}</p>
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
                  <p className="text-sm text-muted-foreground">Sinistros</p>
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multa">Multa</SelectItem>
                            <SelectItem value="sinistro">Sinistro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data *</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Veículo *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Fiat Strada - ABC-1234</SelectItem>
                            <SelectItem value="2">VW Saveiro - DEF-5678</SelectItem>
                            <SelectItem value="3">Renault Master - GHI-9012</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Motorista</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Carlos Oliveira</SelectItem>
                            <SelectItem value="2">Maria Santos</SelectItem>
                            <SelectItem value="3">José Silva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input type="number" step="0.01" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição *</Label>
                      <Textarea placeholder="Descreva a ocorrência..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Anexos</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Arraste arquivos ou clique para selecionar
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, PNG (máx. 5MB)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="flex-1" onClick={() => setDialogOpen(false)}>
                        Registrar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Badge variant="outline" className={tipoColors[incident.tipo]}>
                          {incident.tipo === "multa" ? "Multa" : "Sinistro"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(incident.data).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{incident.veiculo}</p>
                          <p className="text-sm text-muted-foreground">{incident.placa}</p>
                        </div>
                      </TableCell>
                      <TableCell>{incident.motorista}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {incident.descricao}
                      </TableCell>
                      <TableCell className="font-medium">
                        {incident.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[incident.status]}>
                          {statusLabels[incident.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
