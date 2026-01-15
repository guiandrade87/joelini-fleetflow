import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoJoelini from "@/assets/logo-joelini.png";
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Fuel,
  Wrench,
  AlertTriangle,
  FileCheck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Veículos", href: "/veiculos", icon: <Car className="h-5 w-5" />, roles: ["admin", "gestor_frota", "planejamento", "operacional"] },
  { label: "Motoristas", href: "/motoristas", icon: <Users className="h-5 w-5" />, roles: ["admin", "gestor_frota"] },
  { label: "Viagens", href: "/viagens", icon: <Route className="h-5 w-5" /> },
  { label: "Diário de Bordo", href: "/diario-bordo", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Abastecimentos", href: "/abastecimentos", icon: <Fuel className="h-5 w-5" /> },
  { label: "Manutenção", href: "/manutencao", icon: <Wrench className="h-5 w-5" />, badge: 3, roles: ["admin", "gestor_frota", "planejamento"] },
  { label: "Ocorrências", href: "/ocorrencias", icon: <AlertTriangle className="h-5 w-5" />, roles: ["admin", "gestor_frota", "planejamento", "operacional"] },
  { label: "Termos", href: "/termos", icon: <FileCheck className="h-5 w-5" /> },
  { label: "Relatórios", href: "/relatorios", icon: <BarChart3 className="h-5 w-5" />, roles: ["admin", "gestor_frota", "planejamento", "operacional"] },
  { label: "Auditoria", href: "/auditoria", icon: <Settings className="h-5 w-5" />, roles: ["admin", "gestor_frota"] },
  { label: "Configurações", href: "/configuracoes", icon: <Settings className="h-5 w-5" />, roles: ["admin"] },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const userRole = user?.role || "motorista";

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src={logoJoelini} alt="Joelini" className="h-8" />
          <NotificationsDropdown />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
            <img src={logoJoelini} alt="Joelini" className="h-10" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                      )}
                    >
                      <span className={cn(isActive && "text-sidebar-primary")}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-warning text-warning-foreground text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user?.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === "admin" ? "Administrador" : 
                       user?.role === "gestor_frota" ? "Gestor de Frota" :
                       user?.role === "motorista" ? "Motorista" :
                       user?.role === "operacional" ? "Operacional" :
                       user?.role === "planejamento" ? "Planejamento" : "Usuário"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border bg-card">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {filteredNavItems.find((item) => item.href === location.pathname)?.label || "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gestão de Frota
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* Profile Dialog */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
