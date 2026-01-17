import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  // Joined
  user?: { name: string; email: string };
}

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
  vehicles: <Car className="h-4 w-4" />,
  drivers: <User className="h-4 w-4" />,
  trips: <Route className="h-4 w-4" />,
  fuelings: <Fuel className="h-4 w-4" />,
  maintenances: <Wrench className="h-4 w-4" />,
  users: <Shield className="h-4 w-4" />,
  terms: <FileText className="h-4 w-4" />,
  incidents: <FileText className="h-4 w-4" />,
};

const entityLabels: Record<string, string> = {
  vehicles: "Veículo",
  drivers: "Motorista",
  trips: "Viagem",
  fuelings: "Abastecimento",
  maintenances: "Manutenção",
  users: "Usuário",
  terms: "Termo",
  incidents: "Ocorrência",
};

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAcao, setFilterAcao] = useState<string>("all");
  const [filterEntidade, setFilterEntidade] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  // Stats
  const [stats, setStats] = useState({
    totalActions: 0,
    todayActions: 0,
    weekActions: 0,
    activeUsers: 0,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      };

      if (searchTerm) params.search = searchTerm;
      if (filterAcao !== "all") params.action = filterAcao;
      if (filterEntidade !== "all") params.entity = filterEntidade;
      if (filterDate) params.date = filterDate;

      const response = await api.getAuditLogs(params);
      setLogs(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));

      // Calculate stats from data
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      setStats({
        totalActions: response.pagination?.total || 0,
        todayActions: (response.data || []).filter(
          (l: AuditLog) => l.created_at?.split("T")[0] === today
        ).length,
        weekActions: (response.data || []).filter(
          (l: AuditLog) => l.created_at?.split("T")[0] >= weekAgo
        ).length,
        activeUsers: new Set((response.data || []).map((l: AuditLog) => l.user_id)).size,
      });
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterAcao, filterEntidade, filterDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterAcao, filterEntidade, filterDate]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const handleExport = () => {
    toast.info("Funcionalidade de exportação em desenvolvimento");
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
                  <p className="text-2xl font-bold">{stats.totalActions.toLocaleString("pt-BR")}</p>
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
                  <p className="text-2xl font-bold">{stats.todayActions}</p>
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
                  <p className="text-2xl font-bold">{stats.weekActions}</p>
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
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchLogs} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
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
                    <SelectItem value="vehicles">Veículos</SelectItem>
                    <SelectItem value="drivers">Motoristas</SelectItem>
                    <SelectItem value="trips">Viagens</SelectItem>
                    <SelectItem value="fuelings">Abastecimentos</SelectItem>
                    <SelectItem value="maintenances">Manutenções</SelectItem>
                    <SelectItem value="users">Usuários</SelectItem>
                    <SelectItem value="incidents">Ocorrências</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  className="w-[150px]"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum registro encontrado</p>
                </div>
              ) : (
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
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <p className="font-medium">
                              {new Date(log.created_at).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.user?.name || "Sistema"}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.user?.email || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || "bg-muted"}>
                            {actionLabels[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entityIcons[log.entity] || <FileText className="h-4 w-4" />}
                            <span className="capitalize">
                              {entityLabels[log.entity] || log.entity}
                            </span>
                            <span className="text-muted-foreground">#{log.entity_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {log.details || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {log.ip_address || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <p>
                  Mostrando {logs.length} de {pagination.total} registros
                </p>
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
              </div>
            )}
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
                        {new Date(selectedLog.created_at).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(selectedLog.created_at).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Endereço IP</p>
                      <p className="font-mono">{selectedLog.ip_address || "-"}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Usuário</p>
                    <p className="font-medium">{selectedLog.user?.name || "Sistema"}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLog.user?.email || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ação</p>
                      <Badge className={actionColors[selectedLog.action] || "bg-muted"}>
                        {actionLabels[selectedLog.action] || selectedLog.action}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Entidade</p>
                      <div className="flex items-center gap-2">
                        {entityIcons[selectedLog.entity] || <FileText className="h-4 w-4" />}
                        <span className="capitalize">
                          {entityLabels[selectedLog.entity] || selectedLog.entity}
                        </span>
                        <span className="text-muted-foreground">#{selectedLog.entity_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p>{selectedLog.details || "-"}</p>
                  </div>

                  {selectedLog.old_values && selectedLog.new_values && (
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
                            {Object.keys(selectedLog.new_values).map((field) => (
                              <TableRow key={field}>
                                <TableCell className="font-medium capitalize">
                                  {field.replace(/_/g, " ")}
                                </TableCell>
                                <TableCell className="text-destructive/80">
                                  {String(selectedLog.old_values?.[field] ?? "-")}
                                </TableCell>
                                <TableCell className="text-success">
                                  {String(selectedLog.new_values?.[field] ?? "-")}
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
