import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy loading de páginas para melhor performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Trips = lazy(() => import("./pages/Trips"));
const Fuelings = lazy(() => import("./pages/Fuelings"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Reports = lazy(() => import("./pages/Reports"));
const Incidents = lazy(() => import("./pages/Incidents"));
const Terms = lazy(() => import("./pages/Terms"));
const Settings = lazy(() => import("./pages/Settings"));
const Audit = lazy(() => import("./pages/Audit"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/veiculos" element={<Vehicles />} />
            <Route path="/motoristas" element={<Drivers />} />
            <Route path="/viagens" element={<Trips />} />
            <Route path="/abastecimentos" element={<Fuelings />} />
            <Route path="/manutencao" element={<Maintenance />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/ocorrencias" element={<Incidents />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/auditoria" element={<Audit />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
