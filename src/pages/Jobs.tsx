import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  country: string;
  category: string;
  salary_min: number;
  salary_max: number;
  description: string;
  deadline: string;
}

const Jobs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Gagal memuat lowongan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
  const sessionRes = await supabase.auth.getSession();
  const session = sessionRes.data?.session;

  if (!session) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    // For now, just navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('jobs.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('jobs.subtitle')}</p>
          </div>

      {isLoading ? (
            <div className="text-center py-12">
        <p className="text-muted-foreground">{t('jobs.loading')}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
        <p className="text-muted-foreground">{t('jobs.noJobs')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <Badge variant="secondary">{job.category}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{job.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          Rp {job.salary_min?.toLocaleString()} - Rp {job.salary_max?.toLocaleString()}
                        </span>
                      </div>
                      {job.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString("id-ID")}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm line-clamp-3">{job.description}</p>

                    <Button
                      onClick={() => handleApply(job.id)}
                      className="w-full"
                    >
                      {t('jobs.apply')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
};

export default Jobs;
