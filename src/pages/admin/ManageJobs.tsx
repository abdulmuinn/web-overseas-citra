import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  is_active: boolean;
}

const ManageJobs = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    country: "",
    category: "",
    description: "",
    requirements: "",
    is_active: true,
  });

  // ✅ hook harus di bagian atas, tidak boleh setelah kondisi return
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error(t("jobs.loading") || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (editingJob) {
        const { error } = await supabase
          .from("jobs")
          .update(formData)
          .eq("id", editingJob.id);

        if (error) throw error;
        toast.success(t("jobs.updateSuccess") || "Job updated successfully");
      } else {
        const { error } = await supabase.from("jobs").insert([formData as any]);
        if (error) throw error;
        toast.success(t("jobs.createSuccess") || "Job created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(t("jobs.saveFailed") || "Failed to save job");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t("jobs.deleteConfirm") || "Are you sure you want to delete this job?"
      )
    )
      return;

    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
      toast.success(t("jobs.deleteSuccess") || "Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(t("jobs.deleteFailed") || "Failed to delete job");
    }
  };

  const toggleActive = async (job: Job) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: !job.is_active })
        .eq("id", job.id);
      if (error) throw error;
      toast.success(
        !job.is_active
          ? t("jobs.activated") || "Job activated"
          : t("jobs.deactivated") || "Job deactivated"
      );
      fetchJobs();
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error(t("jobs.toggleFailed") || "Failed to toggle job status");
    }
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setFormData(job);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      country: "",
      category: "",
      description: "",
      requirements: "",
      is_active: true,
    });
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat data lowongan...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {t("admin.manageJobs") || "Manage Jobs"}
        </h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("jobs.addJob") || "Add Job"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingJob
                  ? t("jobs.editJob") || "Edit Job"
                  : t("jobs.addNewJob") || "Add New Job"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {t("jobs.title") || "Job Title"} *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    {t("profile.targetCountry") || "Country"} *
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {t("jobs.category") || "Category"} *
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("jobs.description") || "Description"} *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">
                  {t("jobs.requirements") || "Requirements"} *
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">
                    {t("jobs.salaryMin") || "Min Salary (Yen)"}
                  </Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary_min: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">
                    {t("jobs.salaryMax") || "Max Salary (Yen)"}
                  </Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary_max: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">
                  {t("aktif") || "Active"}
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button type="submit">
                  {editingJob
                    ? t("common.save") || "Save"
                    : t("common.submit") || "Submit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {jobs.map((job, idx) => (
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
            <Card className="transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.country} • {job.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active
                        ? t("aktif") || "Active"
                        : t("jobs.inactive") || "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(job)}
                  >
                    {job.is_active ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {job.is_active
                      ? t("jobs.deactivate") || "Deactivate"
                      : t("jobs.activate") || "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(job)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("common.edit") || "Edit"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("common.delete") || "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ManageJobs;
