import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  AlertTriangle,
  Wrench,
  FileCheck,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  tipo: "alerta" | "info" | "warning" | "success";
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    tipo: "warning",
    titulo: "CNH próxima do vencimento",
    mensagem: "A CNH do motorista João Silva vence em 15 dias.",
    lida: false,
    link: "/motoristas",
    createdAt: "2024-01-12T10:30:00Z",
  },
  {
    id: "2",
    tipo: "alerta",
    titulo: "Manutenção pendente",
    mensagem: "Veículo ABC-1234 com manutenção agendada para amanhã.",
    lida: false,
    link: "/manutencao",
    createdAt: "2024-01-12T09:15:00Z",
  },
  {
    id: "3",
    tipo: "success",
    titulo: "Viagem finalizada",
    mensagem: "Viagem SP → RJ concluída com sucesso.",
    lida: false,
    link: "/viagens",
    createdAt: "2024-01-11T18:45:00Z",
  },
  {
    id: "4",
    tipo: "info",
    titulo: "Novo termo disponível",
    mensagem: "Um novo termo de responsabilidade foi publicado.",
    lida: true,
    link: "/termos",
    createdAt: "2024-01-10T14:00:00Z",
  },
  {
    id: "5",
    tipo: "warning",
    titulo: "Documento vencido",
    mensagem: "CRLV do veículo DEF-5678 está vencido.",
    lida: true,
    link: "/veiculos",
    createdAt: "2024-01-09T11:30:00Z",
  },
];

const getNotificationIcon = (tipo: Notification["tipo"]) => {
  switch (tipo) {
    case "alerta":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <Clock className="h-4 w-4 text-warning" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "info":
    default:
      return <FileCheck className="h-4 w-4 text-primary" />;
  }
};

const getNotificationBg = (tipo: Notification["tipo"]) => {
  switch (tipo) {
    case "alerta":
      return "bg-destructive/10";
    case "warning":
      return "bg-warning/10";
    case "success":
      return "bg-success/10";
    case "info":
    default:
      return "bg-primary/10";
  }
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Agora";
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return "Ontem";
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notificações</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} novas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
                    !notification.lida && "bg-muted/30"
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      getNotificationBg(notification.tipo)
                    )}
                  >
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm truncate",
                          !notification.lida && "font-medium"
                        )}
                      >
                        {notification.titulo}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.mensagem}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.lida && (
                    <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              window.location.href = "/configuracoes";
              setOpen(false);
            }}
          >
            Ver todas as configurações de notificação
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
