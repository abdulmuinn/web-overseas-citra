import { NavLink, useNavigate } from "react-router-dom";
import { User, Briefcase, FileText, ClipboardList, LogOut, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const menuItems = [
  { key: "dashboard.profile", url: "/dashboard/profile", icon: User },
  { key: "dashboard.recommended", url: "/dashboard/recommended", icon: Sparkles },
  { key: "dashboard.jobs", url: "/dashboard/jobs", icon: Briefcase },
  { key: "dashboard.applications", url: "/dashboard/applications", icon: ClipboardList },
  { key: "dashboard.documents", url: "/dashboard/documents", icon: FileText },
];

export function ParticipantSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("auth.logoutFailed") || "Logout failed");
    } else {
      toast.success(t("auth.logoutSuccess") || "Berhasil keluar");
      navigate("/");
    }
  };

  return (
    <Sidebar
      className={`${
        state === "collapsed" ? "w-16" : "w-64"
      } bg-gradient-to-b from-[#0A2647] to-[#144272] text-white border-r border-white/10 shadow-lg transition-all duration-300`}
    >
      <SidebarContent className="h-full flex flex-col justify-between">
        {/* ==== Top Section ==== */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 uppercase tracking-wide px-4 py-2 text-sm font-semibold">
            {t("nav.dashboard") || "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `
                          relative flex items-center px-4 py-2 rounded-lg transition-all duration-300
                          ${
                            isActive
                              ? "bg-white/10 text-white font-semibold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F4A261] rounded-r"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              />
                            )}
                            <Icon className="h-5 w-5 mr-3" />
                            {state !== "collapsed" && (
                              <span className="truncate">{t(item.key)}</span>
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

        {/* ==== Bottom Section (Logout) ==== */}
        <div className="px-4 pb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#F4A261]/20 hover:bg-[#F4A261]/30 text-[#F4A261] rounded-lg py-2 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            {state !== "collapsed" && <span>{t("auth.logout") || "Keluar"}</span>}
          </motion.button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
