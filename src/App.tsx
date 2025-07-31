import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import CurrentWar from "./pages/CurrentWar";
import PlayerRoster from "./pages/PlayerRoster";
import CWL from "./pages/CWL";
import Archives from "./pages/Archives";
import NotFound from "./pages/NotFound";
import atmosphericBg from "@/assets/atmospheric-bg.jpg";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div 
          className="min-h-screen bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${atmosphericBg})` }}
        >
          <div className="atmospheric-overlay" />
          <Navigation />
          <Routes>
            <Route path="/" element={<CurrentWar />} />
            <Route path="/roster" element={<PlayerRoster />} />
            <Route path="/cwl" element={<CWL />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
