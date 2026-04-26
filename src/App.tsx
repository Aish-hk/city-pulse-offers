import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Wallet from "./pages/Wallet.tsx";
import OfferDetail from "./pages/OfferDetail.tsx";
import Redeem from "./pages/Redeem.tsx";
import MerchantDashboard from "./pages/MerchantDashboard.tsx";
import Demo from "./pages/Demo.tsx";
import Profile from "./pages/Profile.tsx";
import Passes from "./pages/Passes.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/wallet/offer/:id" element={<OfferDetail />} />
          <Route path="/wallet/redeem/:id" element={<Redeem />} />
          <Route path="/merchant/:id" element={<MerchantDashboard />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/passes" element={<Passes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
