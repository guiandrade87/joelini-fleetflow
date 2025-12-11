import { Wrench, Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Maintenance {
  id: string;
  vehicle: string;
  plate: string;
  type: string;
  scheduledDate: string;
  daysUntil: number;
}

interface MaintenanceScheduleProps {
  maintenances: Maintenance[];
}

export function MaintenanceSchedule({ maintenances }: MaintenanceScheduleProps) {
  const getDaysUntilBadge = (days: number) => {
    if (days <= 0) {
      return <Badge className="bg-destructive text-destructive-foreground">Atrasada</Badge>;
    }
    if (days <= 7) {
      return <Badge className="bg-warning text-warning-foreground">{days} dias</Badge>;
    }
    return <Badge variant="secondary">{days} dias</Badge>;
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Próximas Manutenções
        </h3>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver agenda
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {maintenances.map((maintenance) => (
          <div
            key={maintenance.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Wrench className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {maintenance.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {maintenance.vehicle} • {maintenance.plate}
              </p>
            </div>
            <div className="text-right">
              {getDaysUntilBadge(maintenance.daysUntil)}
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                <Calendar className="h-3 w-3" />
                {maintenance.scheduledDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
