import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Briefcase, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";

interface Job {
  id: string;
  title: string;
  country: string;
  category: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  min_experience: number | null;
  required_education: string | null;
  match_score: number;
}

const RecommendedJobs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion(); // ⬅️ letakkan paling atas, tidak boleh di bawah kondisi
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchRecommendedJobs(), fetchAppliedJobs()]);
    };
    loadData();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data?.user;

      if (!user) {
        console.warn("User belum login — redirect ke /login");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const jobsWithScores = await Promise.all(
        (data || []).map(async (job) => {
          const { data: scoreData } = await supabase.rpc("calculate_match_score", {
            p_user_id: user.id,
            p_job_id: job.id,
          });
          return { ...job, match_score: scoreData || 0 };
        })
      );

      const recommendedJobs = jobsWithScores
        .filter((job) => job.match_score >= 50)
        .sort((a, b) => b.match_score - a.match_score);

      setJobs(recommendedJobs);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      toast.error(t("recommendedJobs.loadFailed") || "Gagal memuat rekomendasi pekerjaan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setAppliedJobs(new Set(data?.map((app) => app.job_id) || []));
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes.data?.user;
      if (!user) {
        toast.error(t("auth.loginRequired") || "Silakan login terlebih dahulu.");
        return;
      }

      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          user_id: user.id,
          status: "pending",
        });

      if (error) throw error;

      toast.success(t("applications.applySuccess") || "Lamaran berhasil dikirim!");
      setAppliedJobs((prev) => new Set([...prev, jobId]));
    } catch (error: any) {
      console.error("Error applying to job:", error);
      if (error.code === "23505") {
        toast.error(t("applications.alreadyApplied") || "Kamu sudah melamar pekerjaan ini.");
      } else {
        toast.error(t("applications.applyFailed") || "Gagal melamar pekerjaan.");
      }
    }
  };

  const getMatchBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return t("recommendedJobs.match.very") || "Sangat Cocok";
    if (score >= 70) return t("recommendedJobs.match.good") || "Cocok";
    return t("recommendedJobs.match.fair") || "Cukup Cocok";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-lg text-muted-foreground">
        {t("common.loading") || "Memuat data..."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            {t("recommendedJobs.title") || "Rekomendasi Pekerjaan"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t("recommendedJobs.subtitle") || "Berikut rekomendasi pekerjaan sesuai profilmu."}
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              {t("recommendedJobs.empty") || "Belum ada rekomendasi saat ini."}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("recommendedJobs.completeProfile") ||
                "Lengkapi profilmu untuk mendapatkan rekomendasi yang lebih akurat."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/dashboard/profile")}
            >
              {t("recommendedJobs.completeProfileButton") || "Lengkapi Profil"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, idx) => {
            const isApplied = appliedJobs.has(job.id);

            return (
              <motion.div
                key={job.id}
                initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: idx * 0.05, duration: 0.35 }
                }
                whileHover={reduceMotion ? undefined : { y: -6 }}
              >
                <Card className="border-2 border-primary/20 transition-all duration-300 hover:shadow-xl hover:border-primary/40">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-2xl">
                          {job.title || "Tanpa Judul"}
                        </CardTitle>
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
                        <Badge
                          variant={getMatchBadgeVariant(job.match_score)}
                          className="text-lg px-4 py-1"
                        >
                          {job.match_score}%{" "}
                          {t("recommendedJobs.matchLabel") || "Match"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getMatchLabel(job.match_score)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t">
                      {job.salary_min && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("jobs.salary") || "Gaji"}
                          </p>
                          <p className="text-sm font-medium">
                            {job.salary_min.toLocaleString("id-ID")} -{" "}
                            {job.salary_max?.toLocaleString("id-ID")} Yen
                          </p>
                        </div>
                      )}
                      {job.min_experience !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("jobs.experience") || "Pengalaman"}
                          </p>
                          <p className="text-sm font-medium">
                            {job.min_experience > 0
                              ? `${job.min_experience} tahun`
                              : t("profile.freshGraduate") || "Fresh Graduate"}
                          </p>
                        </div>
                      )}
                      {job.required_education && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("jobs.education") || "Pendidikan"}
                          </p>
                          <p className="text-sm font-medium">
                            {job.required_education}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApply(job.id)}
                        disabled={isApplied}
                        className="flex-1"
                      >
                        {isApplied
                          ? t("applications.applied") || "Sudah Dilamar"
                          : t("applications.applyNow") || "Lamar Sekarang"}
                      </Button>
                      {isApplied && (
                        <Button
                          variant="outline"
                          onClick={() => navigate("/dashboard/applications")}
                        >
                          {t("applications.viewStatus") || "Lihat Status"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard/jobs")}
                      >
                        {t("jobs.viewDetails") || "Lihat Detail"}
                      </Button>
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

export default RecommendedJobs;
