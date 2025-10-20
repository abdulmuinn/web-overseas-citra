import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Briefcase, Users, FileText, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: t("admin.dashboard"), url: "/admin", icon: LayoutDashboard },
    { title: t("admin.manageJobs"), url: "/admin/jobs", icon: Briefcase },
    { title: t("admin.manageParticipants"), url: "/admin/participants", icon: Users },
    { title: t("admin.reports"), url: "/admin/reports", icon: FileText },
  ];

  const getIsActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("auth.logoutFailed"));
    } else {
      toast.success(t("auth.logoutSuccess"));
      navigate("/");
    }
  };

  return (
    <Sidebar
      className={cn(
        "relative overflow-hidden border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 shadow-2xl",
        state === "collapsed" ? "w-16" : "w-64",
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.45),_transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.35),_transparent_60%)] blur-3xl" />
      </div>

      <SidebarContent className="relative z-10 gap-4 px-2 py-4">
        <SidebarHeader className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              {state !== "collapsed" && (
                <div>
                  <p className="text-sm font-semibold text-white">{t("admin.sidebarTitle")}</p>
                  <p className="text-xs text-slate-300">Monitor hiring performance at a glance</p>
                </div>
              )}
            </div>
            <SidebarTrigger className="text-slate-200 transition hover:text-white" />
          </div>

          {state !== "collapsed" && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200">
              <div className="rounded-xl bg-indigo-500/10 px-3 py-2">
                <p className="text-base font-semibold text-white">12</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-indigo-200/80">Open Roles</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 px-3 py-2">
                <p className="text-base font-semibold text-white">58</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-emerald-200/80">Active Applicants</p>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarGroup className="gap-3">
          <SidebarGroupLabel className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-widest text-slate-300/80">
            <span>{t("admin.navigation", { defaultValue: "Navigation" })}</span>
            {state !== "collapsed" && <Badge className="bg-emerald-500/20 text-emerald-200">Live</Badge>}
          </SidebarGroupLabel>
          <SidebarSeparator className="border-white/10 bg-white/10" />
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = getIsActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-200 transition-all duration-200",
                        isActive
                          ? "bg-white/15 text-white shadow-[0_8px_24px_-12px_rgba(99,102,241,0.9)] backdrop-blur"
                          : "hover:border-white/10 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="flex w-full items-center gap-3"
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-all duration-200",
                            isActive ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200" : "group-hover:border-indigo-400/30 group-hover:bg-indigo-500/10 group-hover:text-indigo-100",
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        {state !== "collapsed" && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto space-y-3">
          {state !== "collapsed" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-white">Need to boost visibility?</p>
              <p className="mt-1 text-[13px] text-slate-300">
                Refresh your postings to reach more overseas candidates today.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 w-full bg-indigo-500 text-white hover:bg-indigo-400"
              >
                <NavLink to="/admin/jobs">{t("admin.manageJobs")}</NavLink>
              </Button>
            </div>
          )}

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={t("admin.logout")}
                onClick={handleLogout}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-rose-500/10 hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-200 transition group-hover:border-rose-400/40 group-hover:bg-rose-500/20">
                  <LogOut className="h-4 w-4" />
                </span>
                {state !== "collapsed" && <span>{t("admin.logout")}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
