import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  Eye,
  History,
  User,
  Car,
  Route,
  Fuel,
  Wrench,
  Shield,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLog {
  id: number;
  usuario: string;
  email: string;
  acao: string;
  entidade: string;
  entidadeId: number;
  detalhes: string;
  ip: string;
  dataHora: string;
  changes?: Record<string, { old: string; new: string }>;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    usuario: "João da Silva",
    email: "joao@joelini.com.br",
    acao: "CREATE",
    entidade: "viagem",
    entidadeId: 45,
    detalhes: "Nova viagem criada para Fiat Strada ABC-1234",
    ip: "192.168.1.45",
    dataHora: "2024-01-10T15:32:00",
  },
  {
    id: 2,
    usuario: "Maria Santos",
    email: "maria@joelini.com.br",
    acao: "UPDATE",
    entidade: "veiculo",
    entidadeId: 3,
    detalhes: "Odômetro atualizado para VW Saveiro DEF-5678",
    ip: "192.168.1.78",
    dataHora: "2024-01-10T14:15:00",
    changes: {
      odometro: { old: "45.230", new: "45.580" },
      situacao: { old: "em_viagem", new: "disponivel" },
    },
  },
  {
    id: 3,
    usuario: "Carlos Oliveira",
    email: "carlos@joelini.com.br",
    acao: "CREATE",
    entidade: "abastecimento",
    entidadeId: 89,
    detalhes: "Abastecimento registrado - R$ 285,00",
    ip: "192.168.1.102",
    dataHora: "2024-01-10T12:45:00",
  },
  {
    id: 4,
    usuario: "João da Silva",
    email: "joao@joelini.com.br",
    acao: "CREATE",
    entidade: "manutencao",
    entidadeId: 12,
    detalhes: "Manutenção preventiva agendada para Renault Master",
    ip: "192.168.1.45",
    dataHora: "2024-01-10T11:20:00",
  },
  {
    id: 5,
    usuario: "Ana Costa",
    email: "ana@joelini.com.br",
    acao: "UPDATE",
    entidade: "motorista",
    entidadeId: 7,
    detalhes: "CNH atualizada para José Silva",
    ip: "192.168.1.33",
    dataHora: "2024-01-10T10:05:00",
    changes: {
      cnh_validade: { old: "2024-03-15", new: "2029-03-15" },
      cnh_categoria: { old: "B", new: "D" },
    },
  },
  {
    id: 6,
    usuario: "João da Silva",
    email: "joao@joelini.com.br",
    acao: "DELETE",
    entidade: "viagem",
    entidadeId: 38,
    detalhes: "Viagem cancelada",
    ip: "192.168.1.45",
    dataHora: "2024-01-10T09:30:00",
  },
  {
    id: 7,
    usuario: "Maria Santos",
    email: "maria@joelini.com.br",
    acao: "CREATE",
    entidade: "usuario",
    entidadeId: 15,
    detalhes: "Novo usuário cadastrado: Roberto Almeida",
    ip: "192.168.1.78",
    dataHora: "2024-01-09T16:45:00",
  },
  {
    id: 8,
    usuario: "Carlos Oliveira",
    email: "carlos@joelini.com.br",
    acao: "CREATE",
    entidade: "termo",
    entidadeId: 23,
    detalhes: "Termo de responsabilidade aceito",
    ip: "192.168.1.102",
    dataHora: "2024-01-09T14:20:00",
  },
];

const actionColors: Record<string, string> = {
  CREATE: "bg-success/20 text-success",
  UPDATE: "bg-primary/20 text-primary",
  DELETE: "bg-destructive/20 text-destructive",
  LOGIN: "bg-muted text-muted-foreground",
  LOGOUT: "bg-muted text-muted-foreground",
};

const actionLabels: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Exclusão",
  LOGIN: "Login",
  LOGOUT: "Logout",
};

const entityIcons: Record<string, React.ReactNode> = {
  veiculo: <Car className="h-4 w-4" />,
  motorista: <User className="h-4 w-4" />,
  viagem: <Route className="h-4 w-4" />,
  abastecimento: <Fuel className="h-4 w-4" />,
  manutencao: <Wrench className="h-4 w-4" />,
  usuario: <Shield className="h-4 w-4" />,
  termo: <FileText className="h-4 w-4" />,
};

export default function Audit() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAcao, setFilterAcao] = useState<string>("all");
  const [filterEntidade, setFilterEntidade] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcao = filterAcao === "all" || log.acao === filterAcao;
    const matchesEntidade = filterEntidade === "all" || log.entidade === filterEntidade;
    return matchesSearch && matchesAcao && matchesEntidade;
  });

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="text-2xl font-bold">1.847</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-bold">32</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Esta Semana</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Log de Auditoria</CardTitle>
                <CardDescription>Histórico completo de ações realizadas no sistema</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, ação ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterAcao} onValueChange={setFilterAcao}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="CREATE">Criação</SelectItem>
                    <SelectItem value="UPDATE">Atualização</SelectItem>
                    <SelectItem value="DELETE">Exclusão</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEntidade} onValueChange={setFilterEntidade}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="veiculo">Veículos</SelectItem>
                    <SelectItem value="motorista">Motoristas</SelectItem>
                    <SelectItem value="viagem">Viagens</SelectItem>
                    <SelectItem value="abastecimento">Abastecimentos</SelectItem>
                    <SelectItem value="manutencao">Manutenções</SelectItem>
                    <SelectItem value="usuario">Usuários</SelectItem>
                    <SelectItem value="termo">Termos</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" className="w-[150px]" />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium">
                            {new Date(log.dataHora).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.usuario}</p>
                          <p className="text-sm text-muted-foreground">{log.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.acao]}>
                          {actionLabels[log.acao]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entityIcons[log.entidade]}
                          <span className="capitalize">{log.entidade}</span>
                          <span className="text-muted-foreground">#{log.entidadeId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {log.detalhes}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {log.ip}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(log)}>
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

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Registro</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Data/Hora</p>
                      <p className="font-medium">
                        {new Date(selectedLog.dataHora).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(selectedLog.dataHora).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Endereço IP</p>
                      <p className="font-mono">{selectedLog.ip}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Usuário</p>
                    <p className="font-medium">{selectedLog.usuario}</p>
                    <p className="text-sm text-muted-foreground">{selectedLog.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ação</p>
                      <Badge className={actionColors[selectedLog.acao]}>
                        {actionLabels[selectedLog.acao]}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Entidade</p>
                      <div className="flex items-center gap-2">
                        {entityIcons[selectedLog.entidade]}
                        <span className="capitalize">{selectedLog.entidade}</span>
                        <span className="text-muted-foreground">#{selectedLog.entidadeId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p>{selectedLog.detalhes}</p>
                  </div>

                  {selectedLog.changes && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Alterações</p>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Campo</TableHead>
                              <TableHead>Valor Anterior</TableHead>
                              <TableHead>Novo Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(selectedLog.changes).map(([field, values]) => (
                              <TableRow key={field}>
                                <TableCell className="font-medium capitalize">
                                  {field.replace(/_/g, " ")}
                                </TableCell>
                                <TableCell className="text-destructive/80">
                                  {values.old}
                                </TableCell>
                                <TableCell className="text-success">
                                  {values.new}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
