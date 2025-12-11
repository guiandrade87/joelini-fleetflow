import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  vehicle: string;
  plate: string;
  driver: string;
  origin: string;
  destination: string;
  date: string;
  km: number;
  status: "em_andamento" | "finalizada" | "agendada";
}

interface RecentTripsTableProps {
  trips: Trip[];
}

export function RecentTripsTable({ trips }: RecentTripsTableProps) {
  const getStatusBadge = (status: Trip["status"]) => {
    switch (status) {
      case "em_andamento":
        return (
          <Badge className="bg-primary/10 text-primary border-0">
            Em andamento
          </Badge>
        );
      case "finalizada":
        return (
          <Badge className="bg-success/10 text-success border-0">
            Finalizada
          </Badge>
        );
      case "agendada":
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            Agendada
          </Badge>
        );
    }
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Últimas Viagens
        </h3>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Veículo
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Motorista
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Rota
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Data
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                KM
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trips.map((trip) => (
              <tr key={trip.id} className="table-row-hover cursor-pointer">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {trip.vehicle}
                    </p>
                    <p className="text-xs text-muted-foreground">{trip.plate}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-foreground">{trip.driver}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-foreground">
                    {trip.origin} → {trip.destination}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-muted-foreground">{trip.date}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-medium text-foreground">
                    {trip.km.toLocaleString()} km
                  </p>
                </td>
                <td className="px-6 py-4">{getStatusBadge(trip.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
