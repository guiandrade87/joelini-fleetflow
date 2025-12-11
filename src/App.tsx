import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Fuelings from "./pages/Fuelings";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Incidents from "./pages/Incidents";
import Terms from "./pages/Terms";
import Settings from "./pages/Settings";
import Audit from "./pages/Audit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
