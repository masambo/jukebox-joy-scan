import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ManagerBarProvider } from "@/hooks/useManagerBar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { BarScanner } from "@/components/BarScanner";
import { BarSelector } from "@/components/BarSelector";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import BarPage from "./pages/BarPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBars from "./pages/admin/AdminBars";
import AdminAlbums from "./pages/admin/AdminAlbums";
import AdminUsers from "./pages/admin/AdminUsers";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerCustomize from "./pages/manager/ManagerCustomize";
import ManagerAlbums from "./pages/manager/ManagerAlbums";
import ManagerPlaylists from "./pages/manager/ManagerPlaylists";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ManagerBarProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/scan" element={<BarScanner />} />
              <Route path="/bars" element={<BarSelector />} />
              <Route path="/bar/:slug" element={<BarPage />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/bars" element={<ProtectedRoute requiredRole="admin"><AdminBars /></ProtectedRoute>} />
              <Route path="/admin/albums" element={<ProtectedRoute requiredRole="admin"><AdminAlbums /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/manager" element={<ProtectedRoute requiredRole="bar_manager"><ManagerDashboard /></ProtectedRoute>} />
              <Route path="/manager/customize" element={<ProtectedRoute requiredRole="bar_manager"><ManagerCustomize /></ProtectedRoute>} />
              <Route path="/manager/albums" element={<ProtectedRoute requiredRole="bar_manager"><ManagerAlbums /></ProtectedRoute>} />
              <Route path="/manager/playlists" element={<ProtectedRoute requiredRole="bar_manager"><ManagerPlaylists /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallPrompt />
          </ManagerBarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
