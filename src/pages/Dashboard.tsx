import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RecentTripsTable } from "@/components/dashboard/RecentTripsTable";
import { MaintenanceSchedule } from "@/components/dashboard/MaintenanceSchedule";
import { Car, Route, Fuel, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const checklistItems = [
  { id: "niveis", label: "Níveis (óleo, água, combustível)" },
  { id: "pneus", label: "Pneus (calibragem e estado)" },
  { id: "luzes", label: "Luzes (faróis, lanternas, setas)" },
  { id: "freios", label: "Freios" },
  { id: "limpador", label: "Limpador de para-brisa" },
  { id: "macaco", label: "Macaco e chave de roda" },
  { id: "extintor", label: "Extintor de incêndio" },
  { id: "triangulo", label: "Triângulo de sinalização" },
  { id: "documentos", label: "Documentos do veículo" },
  { id: "estepe", label: "Estepe" },
];

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
  const navigate = useNavigate();
  const [isFuelingOpen, setIsFuelingOpen] = useState(false);
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleCheckItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setCheckedItems([...checkedItems, itemId]);
    } else {
      setCheckedItems(checkedItems.filter((id) => id !== itemId));
    }
  };

  const handleRegisterFueling = () => {
    setIsFuelingOpen(false);
    toast({
      title: "Abastecimento registrado",
      description: "O abastecimento foi registrado com sucesso.",
    });
  };

  const handleStartTrip = () => {
    if (checkedItems.length < checklistItems.length) {
      toast({
        title: "Checklist incompleto",
        description: "Você precisa verificar todos os itens do checklist antes de iniciar a viagem.",
        variant: "destructive",
      });
      return;
    }
    setIsTripOpen(false);
    setCheckedItems([]);
    setActiveTab("dados");
    toast({
      title: "Viagem iniciada",
      description: "A viagem foi registrada e iniciada com sucesso.",
    });
  };

  const handleScheduleTrip = () => {
    setIsTripOpen(false);
    setCheckedItems([]);
    setActiveTab("dados");
    toast({
      title: "Viagem agendada",
      description: "A viagem foi agendada com sucesso.",
    });
  };

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
            <Button variant="outline" onClick={() => setIsFuelingOpen(true)}>
              <Fuel className="h-4 w-4 mr-2" />
              Registrar Abastecimento
            </Button>
            <Button className="btn-primary-glow" onClick={() => setIsTripOpen(true)}>
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

      {/* Dialog Registrar Abastecimento */}
      <Dialog open={isFuelingOpen} onOpenChange={setIsFuelingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Abastecimento</DialogTitle>
            <DialogDescription>
              Preencha os dados do abastecimento realizado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Fiat Strada - ABC-1234</SelectItem>
                    <SelectItem value="2">VW Saveiro - DEF-5678</SelectItem>
                    <SelectItem value="3">Fiat Ducato - GHI-9012</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorista">Motorista</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">João Silva</SelectItem>
                    <SelectItem value="2">Maria Santos</SelectItem>
                    <SelectItem value="3">Pedro Costa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="km">Odômetro (km)</Label>
                <Input id="km" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="litros">Litros</Label>
                <Input id="litros" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input id="valor" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="combustivel">Combustível</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="etanol">Etanol</SelectItem>
                    <SelectItem value="diesel">Diesel S10</SelectItem>
                    <SelectItem value="gnv">GNV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="posto">Posto</Label>
              <Input id="posto" placeholder="Nome do posto" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFuelingOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterFueling}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Viagem */}
      <Dialog open={isTripOpen} onOpenChange={setIsTripOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nova Viagem</DialogTitle>
            <DialogDescription>
              Preencha os dados da viagem. O checklist é obrigatório antes de iniciar.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados da Viagem</TabsTrigger>
              <TabsTrigger value="checklist">
                Checklist ({checkedItems.length}/{checklistItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veiculo">Veículo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Fiat Strada - ABC-1234</SelectItem>
                      <SelectItem value="2">VW Saveiro - DEF-5678</SelectItem>
                      <SelectItem value="4">Renault Master - JKL-3456</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motorista">Motorista</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="3">Maria Santos</SelectItem>
                      <SelectItem value="4">Pedro Costa</SelectItem>
                      <SelectItem value="5">Ana Rodrigues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origem">Origem</Label>
                  <Input id="origem" placeholder="Cidade, UF" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destino">Destino</Label>
                  <Input id="destino" placeholder="Cidade, UF" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataHoraSaida">Data/Hora Saída</Label>
                  <Input id="dataHoraSaida" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmInicio">KM Inicial</Label>
                  <Input id="kmInicio" type="number" placeholder="0" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade da Viagem</Label>
                <Textarea 
                  id="finalidade" 
                  placeholder="Descreva o motivo da viagem..."
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="checklist" className="space-y-4 pt-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground mb-4">
                  Verifique todos os itens antes de iniciar a viagem. Todos os itens marcados serão registrados como verificados.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={checkedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                      />
                      <Label 
                        htmlFor={item.id} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  placeholder="Observações adicionais sobre o estado do veículo..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsTripOpen(false);
                setCheckedItems([]);
                setActiveTab("dados");
              }}
            >
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleScheduleTrip}>
              Salvar como Agendada
            </Button>
            <Button onClick={handleStartTrip}>
              Iniciar Viagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
