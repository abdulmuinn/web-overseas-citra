import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Clock, Users, FileCheck, Plane, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ApplicationNotesList from "@/components/ApplicationNotesList";
import { useTranslation } from "react-i18next";

interface Application {
  id: string;
  status: string;
  match_score: number | null;
  created_at: string;
  job: {
    title: string;
    country: string;
    category: string;
  };
}

const stepsNormal = [
  { key: "dikirim", label: "Dikirim", icon: Clock },
  { key: "seleksi", label: "Seleksi", icon: FileCheck },
  { key: "interview", label: "Interview", icon: Users },
  { key: "diterima", label: "Diterima", icon: CheckCircle },
  { key: "berangkat", label: "Berangkat", icon: Plane },
];

const stepsRejected = [
  { key: "dikirim", label: "Dikirim", icon: Clock },
  { key: "seleksi", label: "Seleksi", icon: FileCheck },
  { key: "interview", label: "Interview", icon: Users },
  { key: "ditolak", label: "Ditolak", icon: XCircle },
];

const getStepsForStatus = (status: string) =>
  status === "ditolak" ? stepsRejected : stepsNormal;

const colors: Record<string,string> = {
  dikirim: "bg-yellow-500/10 text-yellow-500",
  seleksi: "bg-blue-500/10 text-blue-500",
  interview: "bg-purple-500/10 text-purple-500",
  diterima: "bg-green-500/10 text-green-500",
  berangkat: "bg-primary/10 text-primary",
  ditolak: "bg-red-500/10 text-red-500",
};

const Applications = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data?.user;
  if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          match_score,
          created_at,
          jobs:job_id (
            title,
            country,
            category
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data.map((app: any) => ({
        id: app.id,
        status: app.status,
        match_score: app.match_score,
        created_at: app.created_at,
        job: app.jobs,
      }));

      setApplications(formattedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
  toast.error(t('common.loading') || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => colors[status] || "bg-muted";

  if (loading) {
    return <div>Memuat...</div>;
  }

  const reduceMotion = useReducedMotion();

  return (
    <div className="max-w-6xl mx-auto">
  <h1 className="text-3xl font-bold mb-6">{t('applications.title') || 'My Applications'}</h1>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t('applications.noApplications') || 'No applications yet. Check available jobs and apply now!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application, idx) => {
            const steps = getStepsForStatus(application.status);
            const currentIdx = steps.findIndex(s => s.key === application.status);
            return (
            <motion.div key={application.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: idx * 0.05, duration: 0.35 }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
            >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{application.job.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {application.job.country} • {application.job.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(application.status)}>
                      {steps.find(s => s.key === application.status)?.label || application.status}
                    </Badge>
                    {application.match_score !== null && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Match Score: {application.match_score}%
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Tracker */}
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(currentIdx / (steps.length - 1)) * 100}%`
                      }}
                    />
                  </div>

                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentIdx;
                    const isCurrent = index === currentIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                        >
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <p className={`text-xs mt-2 text-center ${isCompleted ? "font-medium" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardContent>
                <h4 className="text-sm font-medium mb-2">{t('notes.title')}</h4>
                <ApplicationNotesList applicationId={application.id} />
              </CardContent>
            </Card>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
