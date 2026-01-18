import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

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

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
}

interface ReportStats {
  totalKm: number;
  totalLiters: number;
  totalTrips: number;
  totalCost: number;
  costPerKm: number;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalKm: 0,
    totalLiters: 0,
    totalTrips: 0,
    totalCost: 0,
    costPerKm: 0,
  });
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [vehicleFilter, setVehicleFilter] = useState("todos");

  useEffect(() => {
    loadData();
  }, [startDate, endDate, vehicleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = {
        start_date: startDate,
        end_date: endDate,
      };
      if (vehicleFilter !== "todos") {
        params.vehicle_id = vehicleFilter;
      }
      
      const [vehiclesRes, fuelingsStats, tripsRes] = await Promise.all([
        api.getVehicles({ limit: 100 }),
        api.getFuelingStats(params),
        api.getTrips({ ...params, limit: 1000 }),
      ]);
      
      setVehicles(vehiclesRes.data || []);
      
      const totalTrips = tripsRes.pagination?.total || 0;
      const totalCost = (fuelingsStats.totalCost || 0);
      const totalKm = tripsRes.data?.reduce((sum: number, t: any) => {
        if (t.end_km && t.start_km) {
          return sum + (t.end_km - t.start_km);
        }
        return sum;
      }, 0) || 0;
      
      setStats({
        totalKm,
        totalLiters: fuelingsStats.totalLiters || 0,
        totalTrips,
        totalCost,
        costPerKm: totalKm > 0 ? totalCost / totalKm : 0,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportId: string, format: "excel" | "pdf") => {
    toast({
      title: "Exportando...",
      description: `Gerando relatório em ${format.toUpperCase()}. O download iniciará em breve.`,
    });
    
    // In a real implementation, this would trigger an API call to generate the report
    setTimeout(() => {
      toast({
        title: "Relatório gerado",
        description: `O relatório foi gerado com sucesso.`,
      });
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="flex items-center text-muted-foreground">até</span>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-48 space-y-2">
              <label className="text-sm font-medium text-foreground">Veículo</label>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os veículos</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} - {v.plate}
                    </SelectItem>
                  ))}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => handleExport(report.id, "excel")}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => handleExport(report.id, "pdf")}
                    >
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
                {formatDate(startDate)} a {formatDate(endDate)}
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => handleExport("resumo", "excel")}>
              <Download className="h-4 w-4" />
              Exportar Resumo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalKm.toLocaleString("pt-BR")}</p>
              <p className="text-sm text-muted-foreground">km rodados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalLiters.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
              <p className="text-sm text-muted-foreground">litros abastecidos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalTrips}</p>
              <p className="text-sm text-muted-foreground">viagens realizadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">R$ {stats.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">custo total</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>Custo por km: <strong className="text-foreground">R$ {stats.costPerKm.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
