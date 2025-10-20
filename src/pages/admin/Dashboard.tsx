import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Users, FileCheck, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalParticipants: number;
  totalApplications: number;
  pendingApplications: number;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    totalParticipants: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsData, participantsData, applicationsData, pendingData] = await Promise.all([
        supabase.from("jobs").select("id, is_active"),
        supabase.from("profiles").select("id"),
        supabase.from("applications").select("id"),
        supabase.from("applications").select("id").eq("status", "pending"),
      ]);

      setStats({
        totalJobs: jobsData.data?.length || 0,
        activeJobs: jobsData.data?.filter(j => j.is_active).length || 0,
        totalParticipants: participantsData.data?.length || 0,
        totalApplications: applicationsData.data?.length || 0,
        pendingApplications: pendingData.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('admin.totalJobs') || 'Total Jobs',
      value: stats.totalJobs,
      subtitle: `${stats.activeJobs} ${t('admin.active') || 'active'}`,
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: t('admin.totalParticipants') || 'Total Participants',
      value: stats.totalParticipants,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: t('admin.totalApplications') || 'Total Applications',
      value: stats.totalApplications,
      subtitle: `${stats.pendingApplications} ${t('admin.pending') || 'pending'}`,
      icon: FileCheck,
      color: "text-orange-500",
    },
    {
      title: t('admin.conversionRate') || 'Conversion Rate',
      value: `${stats.totalJobs > 0 ? Math.round((stats.totalApplications / stats.totalJobs) * 10) / 10 : 0}`,
      subtitle: t('admin.applicationsPerJob') || 'applications per job',
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  if (loading) {
    return <div>{t('reports.loading') || 'Loading...'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
        {t('admin.dashboardOverview') || 'Dashboard Overview'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: idx * 0.05, duration: 0.35, ease: 'easeOut' }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
            >
              <Card className="transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight">{stat.value}</div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
