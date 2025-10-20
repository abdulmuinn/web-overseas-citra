import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function AdminSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const navigate = useNavigate();

  const menuItems = [
    { title: t("admin.dashboard"), url: "/admin", icon: LayoutDashboard },
    { title: t("admin.manageJobs"), url: "/admin/jobs", icon: Briefcase },
    { title: t("admin.manageParticipants"), url: "/admin/participants", icon: Users },
    { title: t("admin.reports"), url: "/admin/reports", icon: FileText },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("auth.logoutFailed") || "Logout failed");
    } else {
      toast.success(t("auth.logoutSuccess") || "Logged out successfully");
      navigate("/");
    }
  };

  return (
    <Sidebar
      className={`${
        state === "collapsed" ? "w-16" : "w-64"
      } bg-gradient-to-b from-[#0A2647] to-[#0E1E32] text-white shadow-xl border-r border-white/10 transition-all duration-300`}
    >
      <SidebarContent className="h-full flex flex-col justify-between">
        {/* ===== Top Section ===== */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 uppercase tracking-wide px-4 py-2 text-sm font-semibold">
            {t("admin.sidebarTitle") || "Admin Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={({ isActive }) =>
                          `
                          flex items-center px-4 py-2 rounded-lg transition-all duration-300 relative
                          ${
                            isActive
                              ? "bg-white/10 text-white font-semibold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Left border indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F4A261] rounded-r"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              />
                            )}
                            <Icon className="h-5 w-5 mr-3" />
                            {state !== "collapsed" && (
                              <span className="truncate">{item.title}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ===== Bottom Section (Logout) ===== */}
        <div className="px-4 pb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#F4A261]/20 hover:bg-[#F4A261]/30 text-[#F4A261] rounded-lg py-2 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            {state !== "collapsed" && <span>{t("admin.logout") || "Logout"}</span>}
          </motion.button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
