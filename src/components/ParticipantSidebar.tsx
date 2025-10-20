import { NavLink } from "react-router-dom";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      toast.success(t("auth.logoutSuccess") || "Logged out");
      navigate("/");
    }
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarContent>
          <SidebarGroup>
          <SidebarGroupLabel>{t("nav.dashboard") || "Dashboard"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-secondary/20 text-secondary font-medium"
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
            {state !== "collapsed" && <span>{t(item.key)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
          {state !== "collapsed" && <span>{t("auth.logout")}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
