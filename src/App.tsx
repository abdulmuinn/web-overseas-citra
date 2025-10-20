import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Profile from "./pages/dashboard/Profile";
import Applications from "./pages/dashboard/Applications";
import Documents from "./pages/dashboard/Documents";
import DashboardJobs from "./pages/dashboard/DashboardJobs";
import RecommendedJobs from "./pages/dashboard/RecommendedJobs";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageParticipants from "./pages/admin/ManageParticipants";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/jobs" element={<Jobs />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardJobs />} />
            <Route path="profile" element={<Profile />} />
            <Route path="jobs" element={<DashboardJobs />} />
            <Route path="recommended" element={<RecommendedJobs />} />
            <Route path="applications" element={<Applications />} />
            <Route path="documents" element={<Documents />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="participants" element={<ManageParticipants />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
