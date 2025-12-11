import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Car,
  Fuel,
  Wrench,
  DollarSign,
  Route,
} from "lucide-react";

const reportTypes = [
  {
    id: "consumo",
    title: "Consumo por Veículo",
    description: "Análise de km rodados e combustível consumido",
    icon: Fuel,
  },
  {
    id: "custos",
    title: "Custos por Centro de Custo",
    description: "Detalhamento de gastos por departamento",
    icon: DollarSign,
  },
  {
    id: "viagens",
    title: "Relatório de Viagens",
    description: "Histórico completo de deslocamentos",
    icon: Route,
  },
  {
    id: "manutencao",
    title: "Manutenções Realizadas",
    description: "Preventivas e corretivas no período",
    icon: Wrench,
  },
  {
    id: "motoristas",
    title: "Uso por Motorista",
    description: "Estatísticas de uso por colaborador",
    icon: Car,
  },
  {
    id: "frota",
    title: "Status da Frota",
    description: "Visão geral da situação dos veículos",
    icon: BarChart3,
  },
];

export default function Reports() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
            <p className="text-muted-foreground">
              Gere e exporte relatórios da frota
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-foreground">Período</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="2024-12-01"
                />
                <span className="flex items-center text-muted-foreground">até</span>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="2024-12-11"
                />
              </div>
            </div>
            <div className="w-full sm:w-48 space-y-2">
              <label className="text-sm font-medium text-foreground">Veículo</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os veículos</SelectItem>
                  <SelectItem value="1">Fiat Strada - ABC-1234</SelectItem>
                  <SelectItem value="2">VW Saveiro - DEF-5678</SelectItem>
                  <SelectItem value="3">Fiat Ducato - GHI-9012</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48 space-y-2">
              <label className="text-sm font-medium text-foreground">Centro de Custo</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="logistica">Logística</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="entregas">Entregas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className="p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/20 group"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats Preview */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Resumo do Período
              </h3>
              <p className="text-sm text-muted-foreground">
                01/12/2024 a 11/12/2024
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Resumo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">12.450</p>
              <p className="text-sm text-muted-foreground">km rodados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">256</p>
              <p className="text-sm text-muted-foreground">litros abastecidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">47</p>
              <p className="text-sm text-muted-foreground">viagens realizadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">R$ 24.580</p>
              <p className="text-sm text-muted-foreground">custo total</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>Custo por km: <strong className="text-foreground">R$ 1,97</strong></span>
              <span className="text-success">(5% menor que o mês anterior)</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
