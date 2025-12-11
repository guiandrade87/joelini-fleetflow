import { AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  date: string;
}

interface AlertCardProps {
  alerts: Alert[];
}

export function AlertCard({ alerts }: AlertCardProps) {
  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "danger":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning";
      default:
        return "bg-accent border-accent text-accent-foreground";
    }
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Alertas</h3>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum alerta pendente
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                getAlertStyles(alert.type)
              )}
            >
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{alert.description}</p>
              </div>
              <span className="text-xs opacity-60 shrink-0">{alert.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
