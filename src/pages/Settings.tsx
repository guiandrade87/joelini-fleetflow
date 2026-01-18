import { useState, useEffect } from "react";
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
  DialogFooter,
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
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  last_login?: string;
  driver_id?: string;
}

interface Driver {
  id: string;
  name: string;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [settings, setSettings] = useState<Record<string, { value: string; description: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    driverId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, driversRes, settingsData] = await Promise.all([
        api.getUsers(),
        api.getDrivers({ limit: 100 }),
        api.getSettings()
      ]);
      setUsers(usersData);
      setDrivers(driversRes.data);
      setSettings(settingsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "", password: "", driverId: "" });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      driverId: user.driver_id || "",
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({
        title: "Erro",
        description: "Informe a senha para o novo usuário.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          driver_id: formData.driverId || null,
        });
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        await api.createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          driver_id: formData.driverId || null,
        });
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso.",
        });
      }

      await loadData();
      setUserDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar usuário.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setSaving(true);
      await api.deleteUser(userToDelete.id);
      await loadData();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

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
                  <Button onClick={handleOpenNewUser}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
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
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleColors[user.role] || "bg-muted"}>
                              {roleLabels[user.role] || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.active ? "default" : "secondary"} 
                              className={user.active ? "bg-success/20 text-success" : ""}
                            >
                              {user.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.last_login)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive" 
                                onClick={() => {
                                  setUserToDelete(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
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
                                <Check className="h-4 w-4 text-success mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground mx-auto" />
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Configurações de Notificações</CardTitle>
                <CardDescription>Configure como você deseja receber alertas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Canais de Notificação</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-muted-foreground">Integração com canal do Slack</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Alertas de CNH</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">30 dias antes do vencimento</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">15 dias antes do vencimento</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">7 dias antes do vencimento</p>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Alertas de Manutenção</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">30 dias antes da data agendada</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">7 dias antes da data agendada</p>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrações */}
          <TabsContent value="integracoes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Integrações</CardTitle>
                <CardDescription>Conecte o sistema a outras ferramentas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">GPS / Telemetria</p>
                    <p className="text-sm text-muted-foreground">Integração com rastreadores</p>
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">ERP</p>
                    <p className="text-sm text-muted-foreground">Integração com sistema financeiro</p>
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Slack</p>
                    <p className="text-sm text-muted-foreground">Notificações via Slack</p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Parâmetros do Sistema</CardTitle>
                <CardDescription>Configure os parâmetros gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input 
                      defaultValue={settings.company_name?.value || "Joelini Transportes"} 
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail para Notificações</Label>
                    <Input 
                      type="email"
                      defaultValue={settings.notification_email?.value || ""} 
                      placeholder="email@empresa.com.br"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo Padrão de Manutenção (km)</Label>
                    <Input 
                      type="number"
                      defaultValue={settings.maintenance_interval_km?.value || "10000"} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite de Upload (MB)</Label>
                    <Input 
                      type="number"
                      defaultValue={settings.upload_limit_mb?.value || "10"} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retenção de Logs (dias)</Label>
                    <Input 
                      type="number"
                      defaultValue={settings.log_retention_days?.value || "365"} 
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-medium">Backup e Restauração</h4>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      Fazer Backup
                    </Button>
                    <Button variant="outline">
                      Restaurar Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Cadastrar Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input 
                placeholder="Nome do usuário" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input 
                type="email" 
                placeholder="email@joelini.com.br" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value, driverId: value !== "motorista" ? "" : formData.driverId })}
              >
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
            
            {formData.role === "motorista" && (
              <div className="space-y-2">
                <Label>Vincular ao Motorista</Label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Ao vincular, o usuário verá apenas suas próprias viagens
                </p>
              </div>
            )}

            {!editingUser && (
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  O usuário deverá alterar a senha no primeiro acesso.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário "{userToDelete?.name}" será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
