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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Shield,
  Bell,
  Link2,
  Database,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Mail,
  Slack,
  MapPin,
  Building2,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "ativo" | "inativo";
  lastAccess: string;
}

const mockUsers: User[] = [
  { id: 1, name: "João da Silva", email: "joao@joelini.com.br", role: "admin", status: "ativo", lastAccess: "2024-01-10T14:32:00" },
  { id: 2, name: "Maria Santos", email: "maria@joelini.com.br", role: "gestor_frota", status: "ativo", lastAccess: "2024-01-10T12:15:00" },
  { id: 3, name: "Carlos Oliveira", email: "carlos@joelini.com.br", role: "motorista", status: "ativo", lastAccess: "2024-01-09T16:45:00" },
  { id: 4, name: "Ana Costa", email: "ana@joelini.com.br", role: "operacional", status: "ativo", lastAccess: "2024-01-10T09:20:00" },
  { id: 5, name: "Roberto Almeida", email: "roberto@joelini.com.br", role: "motorista", status: "inativo", lastAccess: "2024-01-05T11:00:00" },
];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  gestor_frota: "Gestor de Frota",
  planejamento: "Planejamento",
  operacional: "Operacional",
  motorista: "Motorista",
};

const roleColors: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  gestor_frota: "bg-success/20 text-success",
  planejamento: "bg-warning/20 text-warning-foreground",
  operacional: "bg-muted text-muted-foreground",
  motorista: "bg-secondary text-secondary-foreground",
};

export default function Settings() {
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [cnhAlert30, setCnhAlert30] = useState(true);
  const [cnhAlert15, setCnhAlert15] = useState(true);
  const [cnhAlert7, setCnhAlert7] = useState(true);
  const [maintenanceAlert30, setMaintenanceAlert30] = useState(true);
  const [maintenanceAlert7, setMaintenanceAlert7] = useState(true);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="usuarios" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permissões</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="integracoes" className="gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* Usuários */}
          <TabsContent value="usuarios">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Usuários do Sistema</CardTitle>
                    <CardDescription>Gerencie os usuários e suas permissões de acesso</CardDescription>
                  </div>
                  <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nome Completo *</Label>
                          <Input placeholder="Nome do usuário" />
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail *</Label>
                          <Input type="email" placeholder="email@joelini.com.br" />
                        </div>
                        <div className="space-y-2">
                          <Label>Perfil de Acesso *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="gestor_frota">Gestor de Frota</SelectItem>
                              <SelectItem value="planejamento">Planejamento</SelectItem>
                              <SelectItem value="operacional">Operacional</SelectItem>
                              <SelectItem value="motorista">Motorista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Senha Temporária *</Label>
                          <Input type="password" placeholder="••••••••" />
                          <p className="text-xs text-muted-foreground">
                            O usuário deverá alterar a senha no primeiro acesso.
                          </p>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setUserDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button className="flex-1" onClick={() => setUserDialogOpen(false)}>
                            Cadastrar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Usuário</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Acesso</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleColors[user.role]}>
                              {roleLabels[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === "ativo" ? "default" : "secondary"} className={user.status === "ativo" ? "bg-success/20 text-success" : ""}>
                              {user.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.lastAccess).toLocaleDateString("pt-BR")}{" "}
                            às {new Date(user.lastAccess).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissões */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Matriz de Permissões</CardTitle>
                <CardDescription>Configure as permissões de cada perfil de usuário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px]">Funcionalidade</TableHead>
                        <TableHead className="text-center">Admin</TableHead>
                        <TableHead className="text-center">Gestor</TableHead>
                        <TableHead className="text-center">Planej.</TableHead>
                        <TableHead className="text-center">Operac.</TableHead>
                        <TableHead className="text-center">Motorista</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "Visualizar Dashboard", permissions: [true, true, true, true, true] },
                        { name: "Gerenciar Veículos", permissions: [true, true, true, false, false] },
                        { name: "Gerenciar Motoristas", permissions: [true, true, false, false, false] },
                        { name: "Criar Viagens", permissions: [true, true, true, true, false] },
                        { name: "Registrar Abastecimentos", permissions: [true, true, true, true, true] },
                        { name: "Agendar Manutenções", permissions: [true, true, true, false, false] },
                        { name: "Aprovar Manutenções", permissions: [true, true, false, false, false] },
                        { name: "Ver Relatórios", permissions: [true, true, true, true, false] },
                        { name: "Exportar Dados", permissions: [true, true, true, false, false] },
                        { name: "Gerenciar Usuários", permissions: [true, false, false, false, false] },
                        { name: "Configurar Sistema", permissions: [true, false, false, false, false] },
                        { name: "Ver Auditoria", permissions: [true, true, false, false, false] },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          {row.permissions.map((perm, j) => (
                            <TableCell key={j} className="text-center">
                              {perm ? (
                                <Check className="h-5 w-5 text-success mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Canais de Notificação</CardTitle>
                  <CardDescription>Configure como deseja receber as notificações do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Notificações por E-mail</p>
                        <p className="text-sm text-muted-foreground">Receba alertas no seu e-mail corporativo</p>
                      </div>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Slack className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Integração Slack</p>
                        <p className="text-sm text-muted-foreground">Envie alertas para um canal do Slack</p>
                      </div>
                    </div>
                    <Switch checked={slackNotifications} onCheckedChange={setSlackNotifications} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Alertas de CNH</CardTitle>
                  <CardDescription>Configure quando deseja ser alertado sobre vencimento de CNH</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">30 dias antes do vencimento</p>
                    <Switch checked={cnhAlert30} onCheckedChange={setCnhAlert30} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">15 dias antes do vencimento</p>
                    <Switch checked={cnhAlert15} onCheckedChange={setCnhAlert15} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">7 dias antes do vencimento</p>
                    <Switch checked={cnhAlert7} onCheckedChange={setCnhAlert7} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Alertas de Manutenção</CardTitle>
                  <CardDescription>Configure quando deseja ser alertado sobre manutenções programadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">30 dias antes da manutenção</p>
                    <Switch checked={maintenanceAlert30} onCheckedChange={setMaintenanceAlert30} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">7 dias antes da manutenção</p>
                    <Switch checked={maintenanceAlert7} onCheckedChange={setMaintenanceAlert7} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrações */}
          <TabsContent value="integracoes">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">GPS / Telemetria</CardTitle>
                        <CardDescription>Integração com sistema de rastreamento veicular</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Não Configurado</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conecte seu sistema de GPS para receber dados de localização e quilometragem automaticamente.
                  </p>
                  <Button variant="outline">Configurar Integração</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Sistema ERP</CardTitle>
                        <CardDescription>Integração com ERP corporativo</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Não Configurado</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sincronize centros de custo e despesas com seu sistema ERP.
                  </p>
                  <Button variant="outline">Configurar Integração</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Slack className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Slack</CardTitle>
                        <CardDescription>Notificações via Slack</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Não Configurado</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receba alertas e notificações diretamente no seu workspace do Slack.
                  </p>
                  <Button variant="outline">Configurar Integração</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="sistema">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Parâmetros do Sistema</CardTitle>
                  <CardDescription>Configure os parâmetros gerais do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>KM para Manutenção Preventiva</Label>
                      <Input type="number" defaultValue="10000" />
                      <p className="text-xs text-muted-foreground">
                        Intervalo de km para alertas de manutenção preventiva
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tolerância de Discrepância KM</Label>
                      <Input type="number" defaultValue="50" />
                      <p className="text-xs text-muted-foreground">
                        Diferença máxima tolerada entre registros de km
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tamanho Máximo de Upload (MB)</Label>
                      <Input type="number" defaultValue="5" />
                      <p className="text-xs text-muted-foreground">
                        Tamanho máximo permitido para uploads de arquivos
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Dias de Retenção de Logs</Label>
                      <Input type="number" defaultValue="90" />
                      <p className="text-xs text-muted-foreground">
                        Período de retenção dos logs de auditoria
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>Salvar Configurações</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Backup e Restauração</CardTitle>
                  <CardDescription>Gerencie os backups do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">Backup Automático</p>
                      <p className="text-sm text-muted-foreground">Último backup: 10/01/2024 às 03:00</p>
                    </div>
                    <Badge className="bg-success/20 text-success">Ativo</Badge>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">Executar Backup Manual</Button>
                    <Button variant="outline">Restaurar Backup</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
