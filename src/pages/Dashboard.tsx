import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecentTripsTable } from "@/components/dashboard/RecentTripsTable";
import { MaintenanceSchedule } from "@/components/dashboard/MaintenanceSchedule";
import { Car, Route, Fuel, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockAlerts = [
  {
    id: "1",
    type: "danger" as const,
    title: "CNH Vencida",
    description: "Carlos Oliveira - CNH venceu em 05/12/2024",
    date: "Hoje",
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Manutenção Atrasada",
    description: "Fiat Ducato ABC-1234 - Revisão de 50.000km",
    date: "3 dias",
  },
  {
    id: "3",
    type: "warning" as const,
    title: "CNH a Vencer",
    description: "Maria Santos - CNH vence em 15 dias",
    date: "Em 15 dias",
  },
];

const mockTrips = [
  {
    id: "1",
    vehicle: "Fiat Strada",
    plate: "ABC-1234",
    driver: "João Silva",
    origin: "São Paulo",
    destination: "Campinas",
    date: "11/12/2024",
    km: 120,
    status: "em_andamento" as const,
  },
  {
    id: "2",
    vehicle: "VW Saveiro",
    plate: "DEF-5678",
    driver: "Carlos Oliveira",
    origin: "Campinas",
    destination: "Ribeirão Preto",
    date: "10/12/2024",
    km: 245,
    status: "finalizada" as const,
  },
  {
    id: "3",
    vehicle: "Fiat Ducato",
    plate: "GHI-9012",
    driver: "Maria Santos",
    origin: "São Paulo",
    destination: "Santos",
    date: "10/12/2024",
    km: 85,
    status: "finalizada" as const,
  },
  {
    id: "4",
    vehicle: "Renault Master",
    plate: "JKL-3456",
    driver: "Pedro Costa",
    origin: "São Paulo",
    destination: "Guarulhos",
    date: "12/12/2024",
    km: 45,
    status: "agendada" as const,
  },
];

const mockMaintenances = [
  {
    id: "1",
    vehicle: "Fiat Ducato",
    plate: "ABC-1234",
    type: "Revisão 50.000km",
    scheduledDate: "14/12/2024",
    daysUntil: 3,
  },
  {
    id: "2",
    vehicle: "VW Saveiro",
    plate: "DEF-5678",
    type: "Troca de Óleo",
    scheduledDate: "18/12/2024",
    daysUntil: 7,
  },
  {
    id: "3",
    vehicle: "Renault Master",
    plate: "JKL-3456",
    type: "Alinhamento e Balanceamento",
    scheduledDate: "20/12/2024",
    daysUntil: 9,
  },
  {
    id: "4",
    vehicle: "Fiat Strada",
    plate: "MNO-7890",
    type: "Troca de Pneus",
    scheduledDate: "05/12/2024",
    daysUntil: -6,
  },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Bem-vindo de volta!
            </h2>
            <p className="text-muted-foreground">
              Visão geral da frota em dezembro de 2024
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Fuel className="h-4 w-4 mr-2" />
              Registrar Abastecimento
            </Button>
            <Button className="btn-primary-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nova Viagem
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Veículos Ativos"
            value="18"
            subtitle="de 22 veículos"
            icon={<Car className="h-6 w-6" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Viagens no Mês"
            value="47"
            subtitle="8 em andamento"
            icon={<Route className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="KM Total"
            value="12.450"
            subtitle="km rodados em dezembro"
            icon={<Fuel className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Custo Mensal"
            value="R$ 24.580"
            subtitle="combustível + manutenção"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Alerts and Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertCard alerts={mockAlerts} />
          <MaintenanceSchedule maintenances={mockMaintenances} />
        </div>

        {/* Recent Trips */}
        <RecentTripsTable trips={mockTrips} />
      </div>
    </AppLayout>
  );
}
