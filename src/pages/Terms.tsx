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
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface PendingTerm {
  id: number;
  usuario: string;
  cargo: string;
  email: string;
  documento: string;
  enviadoEm: string;
}

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

export default function Terms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const filteredAcceptances = mockAcceptances.filter((acceptance) =>
    acceptance.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acceptance.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acceptance.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <p className="text-2xl font-bold">3</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Documento 1 */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Termo de Responsabilidade</CardTitle>
                        <CardDescription>Versão 2.1 • Atualizado em 15/01/2024</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Documento que estabelece as responsabilidades do colaborador no uso de veículos da frota.
                  </p>
                  <div className="flex gap-2">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Termo de Responsabilidade de Uso de Veículo</DialogTitle>
                          <DialogDescription>
                            Versão 2.1 - Atualizado em 15/01/2024
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4 text-sm">
                            <p>
                              <strong>TERMO DE RESPONSABILIDADE DE USO DE VEÍCULO DA FROTA JOELINI</strong>
                            </p>
                            <p>
                              Pelo presente instrumento particular, eu, colaborador(a) da JOELINI LTDA., declaro estar ciente e de acordo com as seguintes condições para utilização dos veículos da frota da empresa:
                            </p>
                            <p>
                              <strong>1. CONDIÇÕES DE USO</strong>
                            </p>
                            <p>
                              1.1. Comprometo-me a utilizar o veículo exclusivamente para fins de trabalho, respeitando as normas de trânsito vigentes.
                            </p>
                            <p>
                              1.2. Declaro possuir Carteira Nacional de Habilitação (CNH) válida e compatível com a categoria do veículo.
                            </p>
                            <p>
                              1.3. Comprometo-me a realizar o checklist obrigatório antes de cada viagem.
                            </p>
                            <p>
                              <strong>2. RESPONSABILIDADES</strong>
                            </p>
                            <p>
                              2.1. Sou responsável por qualquer infração de trânsito cometida durante a utilização do veículo.
                            </p>
                            <p>
                              2.2. Em caso de sinistro, devo comunicar imediatamente à empresa e seguir os procedimentos estabelecidos.
                            </p>
                            <p>
                              2.3. Comprometo-me a manter o veículo em boas condições de conservação e limpeza.
                            </p>
                            <p>
                              <strong>3. PROIBIÇÕES</strong>
                            </p>
                            <p>
                              3.1. É proibido o uso do veículo sob efeito de álcool ou substâncias entorpecentes.
                            </p>
                            <p>
                              3.2. É proibido o transporte de pessoas não autorizadas.
                            </p>
                            <p>
                              3.3. É proibida a utilização do veículo para fins particulares sem prévia autorização.
                            </p>
                            <p>
                              <strong>4. PENALIDADES</strong>
                            </p>
                            <p>
                              O descumprimento das normas estabelecidas neste termo poderá acarretar em medidas disciplinares, conforme regulamento interno da empresa.
                            </p>
                            <p className="text-muted-foreground italic">
                              Declaro ter lido e concordar com todos os termos acima descritos.
                            </p>
                          </div>
                        </ScrollArea>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="accept"
                              checked={acceptTerms}
                              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                            />
                            <label htmlFor="accept" className="text-sm leading-relaxed cursor-pointer">
                              Declaro que li, entendi e concordo com todos os termos e condições estabelecidos neste documento.
                            </label>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button className="flex-1" disabled={!acceptTerms} onClick={() => setDialogOpen(false)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Aceitar Termo
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Documento 2 */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Termo de Uso de Veículos</CardTitle>
                        <CardDescription>Versão 1.0 • Atualizado em 01/12/2023</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Normas gerais para utilização dos veículos da frota corporativa.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Documento 3 */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Política de Multas</CardTitle>
                        <CardDescription>Versão 1.2 • Atualizado em 20/11/2023</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">Inativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Política interna para tratamento de multas de trânsito.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
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
