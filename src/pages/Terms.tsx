import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  FileCheck,
  FileText,
  Clock,
  CheckCircle2,
  User,
  Car,
  Calendar,
  Shield,
  Download,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Acceptance {
  id: number;
  usuario: string;
  cargo: string;
  veiculo: string;
  placa: string;
  dataAceite: string;
  ip: string;
  documento: string;
}

interface PendingTerm {
  id: number;
  usuario: string;
  cargo: string;
  email: string;
  documento: string;
  enviadoEm: string;
}

interface TermDocument {
  id: number;
  titulo: string;
  tipo: string;
  versao: string;
  conteudo: string;
  ativo: boolean;
  atualizadoEm: string;
}

const mockAcceptances: Acceptance[] = [
  {
    id: 1,
    usuario: "Carlos Oliveira",
    cargo: "Motorista",
    veiculo: "Fiat Strada",
    placa: "ABC-1234",
    dataAceite: "2024-01-10T14:32:00",
    ip: "192.168.1.45",
    documento: "Termo de Responsabilidade v2.1",
  },
  {
    id: 2,
    usuario: "Maria Santos",
    cargo: "Motorista",
    veiculo: "VW Saveiro",
    placa: "DEF-5678",
    dataAceite: "2024-01-09T09:15:00",
    ip: "192.168.1.78",
    documento: "Termo de Responsabilidade v2.1",
  },
  {
    id: 3,
    usuario: "José Silva",
    cargo: "Operacional",
    veiculo: "Renault Master",
    placa: "GHI-9012",
    dataAceite: "2024-01-08T16:45:00",
    ip: "192.168.1.102",
    documento: "Termo de Responsabilidade v2.1",
  },
  {
    id: 4,
    usuario: "Ana Costa",
    cargo: "Motorista",
    veiculo: "Ford Ranger",
    placa: "JKL-3456",
    dataAceite: "2024-01-05T11:20:00",
    ip: "192.168.1.33",
    documento: "Termo de Responsabilidade v2.0",
  },
];

const mockPendingTerms: PendingTerm[] = [
  {
    id: 1,
    usuario: "Roberto Almeida",
    cargo: "Motorista",
    email: "roberto@joelini.com.br",
    documento: "Termo de Responsabilidade v2.1",
    enviadoEm: "2024-01-10T08:00:00",
  },
  {
    id: 2,
    usuario: "Fernanda Lima",
    cargo: "Operacional",
    email: "fernanda@joelini.com.br",
    documento: "Termo de Uso de Veículos",
    enviadoEm: "2024-01-09T14:30:00",
  },
];

const defaultTermContent = `TERMO DE RESPONSABILIDADE DE USO DE VEÍCULO DA FROTA JOELINI

Pelo presente instrumento particular, eu, colaborador(a) da JOELINI LTDA., declaro estar ciente e de acordo com as seguintes condições para utilização dos veículos da frota da empresa:

1. CONDIÇÕES DE USO
1.1. Comprometo-me a utilizar o veículo exclusivamente para fins de trabalho, respeitando as normas de trânsito vigentes.
1.2. Declaro possuir Carteira Nacional de Habilitação (CNH) válida e compatível com a categoria do veículo.
1.3. Comprometo-me a realizar o checklist obrigatório antes de cada viagem.

2. RESPONSABILIDADES
2.1. Sou responsável por qualquer infração de trânsito cometida durante a utilização do veículo.
2.2. Em caso de sinistro, devo comunicar imediatamente à empresa e seguir os procedimentos estabelecidos.
2.3. Comprometo-me a manter o veículo em boas condições de conservação e limpeza.

3. PROIBIÇÕES
3.1. É proibido o uso do veículo sob efeito de álcool ou substâncias entorpecentes.
3.2. É proibido o transporte de pessoas não autorizadas.
3.3. É proibida a utilização do veículo para fins particulares sem prévia autorização.

4. PENALIDADES
O descumprimento das normas estabelecidas neste termo poderá acarretar em medidas disciplinares, conforme regulamento interno da empresa.`;

const initialDocuments: TermDocument[] = [
  {
    id: 1,
    titulo: "Termo de Responsabilidade",
    tipo: "responsabilidade",
    versao: "2.1",
    conteudo: defaultTermContent,
    ativo: true,
    atualizadoEm: "2024-01-15",
  },
  {
    id: 2,
    titulo: "Termo de Uso de Veículos",
    tipo: "uso_veiculo",
    versao: "1.0",
    conteudo: "Normas gerais para utilização dos veículos da frota corporativa.",
    ativo: true,
    atualizadoEm: "2023-12-01",
  },
  {
    id: 3,
    titulo: "Política de Multas",
    tipo: "politica_frota",
    versao: "1.2",
    conteudo: "Política interna para tratamento de multas de trânsito.",
    ativo: false,
    atualizadoEm: "2023-11-20",
  },
];

const tipoLabels: Record<string, string> = {
  responsabilidade: "Responsabilidade",
  uso_veiculo: "Uso de Veículo",
  politica_frota: "Política de Frota",
};

export default function Terms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [documents, setDocuments] = useState<TermDocument[]>(initialDocuments);
  
  // Form state
  const [termFormOpen, setTermFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TermDocument | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    versao: "",
    conteudo: "",
    ativo: true,
  });

  const filteredAcceptances = mockAcceptances.filter((acceptance) =>
    acceptance.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acceptance.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acceptance.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewTerm = () => {
    setEditingTerm(null);
    setFormData({
      titulo: "",
      tipo: "",
      versao: "1.0",
      conteudo: "",
      ativo: true,
    });
    setTermFormOpen(true);
  };

  const handleEditTerm = (term: TermDocument) => {
    setEditingTerm(term);
    setFormData({
      titulo: term.titulo,
      tipo: term.tipo,
      versao: term.versao,
      conteudo: term.conteudo,
      ativo: term.ativo,
    });
    setTermFormOpen(true);
  };

  const handleDeleteTerm = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast.success("Termo excluído com sucesso!");
  };

  const handleSaveTerm = () => {
    if (!formData.titulo || !formData.tipo || !formData.versao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingTerm) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === editingTerm.id
            ? {
                ...doc,
                ...formData,
                atualizadoEm: new Date().toISOString().split("T")[0],
              }
            : doc
        )
      );
      toast.success("Termo atualizado com sucesso!");
    } else {
      const newTerm: TermDocument = {
        id: Math.max(...documents.map((d) => d.id)) + 1,
        ...formData,
        atualizadoEm: new Date().toISOString().split("T")[0],
      };
      setDocuments((prev) => [...prev, newTerm]);
      toast.success("Termo criado com sucesso!");
    }

    setTermFormOpen(false);
  };

  const toggleTermStatus = (id: number) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, ativo: !doc.ativo } : doc
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Aceitos</p>
                  <p className="text-2xl font-bold">{mockAcceptances.length}</p>
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
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{mockPendingTerms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documentos Ativos</p>
                  <p className="text-2xl font-bold">{documents.filter((d) => d.ativo).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="aceitos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="aceitos">Termos Aceitos</TabsTrigger>
            <TabsTrigger value="pendentes">
              Pendentes
              {mockPendingTerms.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-warning text-warning-foreground">
                  {mockPendingTerms.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          {/* Termos Aceitos */}
          <TabsContent value="aceitos">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-semibold">Histórico de Aceites</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Usuário</TableHead>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Data do Aceite</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead className="w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAcceptances.map((acceptance) => (
                        <TableRow key={acceptance.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{acceptance.usuario}</p>
                                <p className="text-sm text-muted-foreground">{acceptance.cargo}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p>{acceptance.veiculo}</p>
                                <p className="text-sm text-muted-foreground">{acceptance.placa}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/5">
                              {acceptance.documento}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(acceptance.dataAceite).toLocaleDateString("pt-BR")}{" "}
                                <span className="text-muted-foreground">
                                  às {new Date(acceptance.dataAceite).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {acceptance.ip}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pendentes */}
          <TabsContent value="pendentes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Termos Pendentes de Aceite</CardTitle>
                <CardDescription>
                  Colaboradores que ainda não assinaram os termos obrigatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingTerms.map((term) => (
                    <div
                      key={term.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{term.usuario}</p>
                          <p className="text-sm text-muted-foreground">
                            {term.cargo} • {term.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{term.documento}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviado em {new Date(term.enviadoEm).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Reenviar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Gerenciar Termos e Documentos</CardTitle>
                    <CardDescription>Crie, edite e gerencie os termos de responsabilidade</CardDescription>
                  </div>
                  <Dialog open={termFormOpen} onOpenChange={setTermFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleOpenNewTerm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Termo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTerm ? "Editar Termo" : "Criar Novo Termo"}
                        </DialogTitle>
                        <DialogDescription>
                          Preencha as informações do termo de responsabilidade
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Título *</Label>
                            <Input
                              placeholder="Ex: Termo de Responsabilidade"
                              value={formData.titulo}
                              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Versão *</Label>
                            <Input
                              placeholder="Ex: 1.0"
                              value={formData.versao}
                              onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo *</Label>
                          <Select
                            value={formData.tipo}
                            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="responsabilidade">Responsabilidade</SelectItem>
                              <SelectItem value="uso_veiculo">Uso de Veículo</SelectItem>
                              <SelectItem value="politica_frota">Política de Frota</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Conteúdo do Termo</Label>
                          <Textarea
                            placeholder="Digite o conteúdo completo do termo..."
                            value={formData.conteudo}
                            onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                            rows={12}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={formData.ativo}
                            onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                          />
                          <Label>Termo Ativo</Label>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setTermFormOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button className="flex-1" onClick={handleSaveTerm}>
                            {editingTerm ? "Salvar Alterações" : "Criar Termo"}
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
                        <TableHead>Documento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Versão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Atualizado</TableHead>
                        <TableHead className="w-[120px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Shield className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{doc.titulo}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tipoLabels[doc.tipo] || doc.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">v{doc.versao}</TableCell>
                          <TableCell>
                            <Switch
                              checked={doc.ativo}
                              onCheckedChange={() => toggleTermStatus(doc.id)}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(doc.atualizadoEm).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>{doc.titulo}</DialogTitle>
                                    <DialogDescription>
                                      Versão {doc.versao} • Atualizado em {new Date(doc.atualizadoEm).toLocaleDateString("pt-BR")}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[400px] pr-4">
                                    <div className="whitespace-pre-wrap text-sm">
                                      {doc.conteudo}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditTerm(doc)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTerm(doc.id)}
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
        </Tabs>
      </div>
    </AppLayout>
  );
}
