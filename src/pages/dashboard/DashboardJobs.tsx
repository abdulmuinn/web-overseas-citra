import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Clock, GraduationCap, DollarSign, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Job {
  id: string;
  title: string;
  country: string;
  category: string;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  min_experience: number | null;
  required_education: string | null;
  deadline: string | null;
  created_at: string;
  match_score?: number;
}

const DashboardJobs = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data?.user;
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Calculate match scores for each job if user is logged in
      if (user && data) {
        const jobsWithScores = await Promise.all(
          data.map(async (job) => {
            const { data: scoreData } = await supabase.rpc("calculate_match_score", {
              p_user_id: user.id,
              p_job_id: job.id,
            });
            return { ...job, match_score: scoreData || 0 };
          })
        );
        setJobs(jobsWithScores);
      } else {
        setJobs(data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
  toast.error(t('jobs.loadFailed') || 'Gagal memuat lowongan');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
  const userRes2 = await supabase.auth.getUser();
  const user2 = userRes2.data?.user;
  if (!user2) return;

      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("user_id", user2.id);

      if (error) throw error;
      setAppliedJobs(new Set(data?.map(app => app.job_id) || []));
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const userRes3 = await supabase.auth.getUser();
      const user3 = userRes3.data?.user;
      if (!user3) {
        toast.error(t('auth.loginRequired') || 'Silakan login terlebih dahulu');
        return;
      }

      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          user_id: user3.id,
          status: "pending",
        });

      if (error) throw error;

  toast.success(t('applications.applySuccess') || 'Lamaran berhasil dikirim!');
      setAppliedJobs(prev => new Set([...prev, jobId]));
    } catch (error: any) {
      console.error("Error applying to job:", error);
      if (error.code === "23505") {
        toast.error(t('applications.alreadyApplied') || 'Anda sudah melamar ke lowongan ini');
      } else {
        toast.error(t('applications.applyFailed') || 'Gagal mengirim lamaran');
      }
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Negotiable";
    if (!max) return `Dari ${min?.toLocaleString("id-ID")} Yen/bulan`;
    if (!min) return `Hingga ${max?.toLocaleString("id-ID")} Yen/bulan`;
    return `${min.toLocaleString("id-ID")} - ${max.toLocaleString("id-ID")} Yen/bulan`;
  };

  if (loading) {
    return <div>{t('common.loading') || 'Memuat...'}</div>;
  }

  const reduceMotion = useReducedMotion();

  return (
    <div className="max-w-6xl mx-auto">
  <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{t('jobs.title') || 'Lowongan Tersedia'}</h1>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t('jobs.noJobs') || 'Belum ada lowongan tersedia saat ini'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, idx) => {
            const isApplied = appliedJobs.has(job.id);
            const daysLeft = job.deadline
              ? Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <motion.div key={job.id}
                initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { delay: idx * 0.05, duration: 0.35 }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
              >
              <Card className="transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{job.title}</CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.category}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge variant="outline">
                        {job.category}
                      </Badge>
                      {job.match_score !== undefined && (
                        <Badge 
                          variant={job.match_score >= 70 ? "default" : job.match_score >= 50 ? "secondary" : "outline"}
                          className="font-semibold"
                        >
                          Match: {job.match_score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{t('jobs.salary') || 'Gaji'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{t('jobs.experience') || 'Pengalaman'}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.min_experience ? `${job.min_experience} tahun` : t('jobs.noExperienceNeeded') || 'Tidak diperlukan'}
                        </p>
                      </div>
                    </div>

                    {job.required_education && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{t('jobs.education') || 'Pendidikan'}</p>
                          <p className="text-sm text-muted-foreground">{job.required_education}</p>
                        </div>
                      </div>
                    )}

                    {daysLeft !== null && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{t('jobs.deadline') || 'Batas Waktu'}</p>
                          <p className="text-sm text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} ${t('jobs.daysLeft') || 'hari lagi'}` : t('jobs.today') || 'Hari ini'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">{t('jobs.requirements') || 'Persyaratan:'}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{job.requirements}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApply(job.id)}
                      disabled={isApplied}
                      className="flex-1"
                    >
                      {isApplied ? (t('applications.applied') || 'Sudah Melamar') : (t('applications.applyNow') || 'Lamar Sekarang')}
                    </Button>
                    {isApplied && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard/applications")}
                      >
                        {t('applications.viewStatus') || 'Lihat Status'}
                      </Button>
                    )}
                  </div>
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

export default DashboardJobs;
