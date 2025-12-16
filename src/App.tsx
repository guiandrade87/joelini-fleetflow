import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/veiculos" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
              <Route path="/motoristas" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
              <Route path="/viagens" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
              <Route path="/abastecimentos" element={<ProtectedRoute><Fuelings /></ProtectedRoute>} />
              <Route path="/manutencao" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/ocorrencias" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
              <Route path="/termos" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
              <Route path="/configuracoes" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
              <Route path="/auditoria" element={<ProtectedRoute roles={['admin', 'gestor_frota']}><Audit /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
