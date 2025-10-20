import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Mail, Phone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import AdminNoteForm from "@/components/AdminNoteForm";
import { fetchNotes, deleteAdminNote } from "@/lib/applicationNotes";
import { useTranslation } from "react-i18next";

interface Participant {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  target_country: string | null;
  education_level: string | null;
  experience_years: number | null;
  languages: string[] | null;
  created_at: string;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  job: {
    title: string;
    country: string;
  };
}

const ManageParticipants = () => {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, any[]>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(profile?.role === 'admin');
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
  toast.error(t('manageParticipants.loadFailed') || 'Gagal memuat peserta');
    } finally {
      setLoading(false);
    }
  };

  const viewParticipantDetails = async (participant: Participant) => {
    setSelectedParticipant(participant);
    
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          created_at,
          jobs:job_id (
            title,
            country
          )
        `)
        .eq("user_id", participant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data.map((app: any) => ({
        id: app.id,
        status: app.status,
        created_at: app.created_at,
        job: app.jobs,
      }));

      setApplications(formattedData);
      // Fetch notes for each application
      const notesRecord: Record<string, any[]> = {};
      await Promise.all(
        formattedData.map(async (app: any) => {
          try {
            const n = await fetchNotes(app.id);
            notesRecord[app.id] = n || [];
          } catch (e) {
            notesRecord[app.id] = [];
          }
        })
      );
      setNotesMap(notesRecord);
    } catch (error) {
      console.error("Error fetching applications:", error);
  toast.error(t('manageParticipants.loadApplicationsFailed') || 'Gagal memuat riwayat lamaran');
    }

    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      dikirim: "bg-yellow-500/10 text-yellow-500",
      seleksi: "bg-blue-500/10 text-blue-500",
      interview: "bg-purple-500/10 text-purple-500",
      diterima: "bg-green-500/10 text-green-500",
      berangkat: "bg-primary/10 text-primary",
      ditolak: "bg-red-500/10 text-red-500",
    };
    return colors[status] || "bg-muted";
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // Show success message
      console.log(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  if (loading) {
    return <div>{t('common.loading') || 'Loading...'}</div>;
  }

  const reduceMotion = useReducedMotion();

  return (
    <div className="max-w-7xl mx-auto">
  <h1 className="text-3xl font-bold mb-6">{t('admin.manageParticipants') || 'Manage Participants'}</h1>

      <div className="grid gap-4">
        {participants.map((participant, idx) => (
          <motion.div key={participant.id}
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: idx * 0.05, duration: 0.35 }}
            whileHover={reduceMotion ? undefined : { y: -6 }}
          >
          <Card className="transition-all duration-300 hover:shadow-xl hover:border-primary/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {participant.full_name || t('common.noName') || 'Name not provided'}
                  </h3>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {participant.email}
                    </div>
                    {participant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {participant.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {participant.target_country && (
                      <Badge variant="outline">{participant.target_country}</Badge>
                    )}
                    {participant.education_level && (
                      <Badge variant="outline">{participant.education_level}</Badge>
                    )}
                    {participant.experience_years !== null && (
                      <Badge variant="outline">{participant.experience_years} tahun exp</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewParticipantDetails(participant)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('common.detail') || 'Detail'}
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{t('admin.participantDetail') || 'Participant Details'}</DialogTitle>
            </DialogHeader>
          
          {selectedParticipant && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('admin.personalInfo') || 'Personal Information'}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                    <span className="text-muted-foreground">{t('common.name') || 'Name'}:</span>
                    <p className="font-medium">{selectedParticipant.full_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedParticipant.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telepon:</span>
                    <p className="font-medium">{selectedParticipant.phone || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Negara Tujuan:</span>
                    <p className="font-medium">{selectedParticipant.target_country || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pendidikan:</span>
                    <p className="font-medium">{selectedParticipant.education_level || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pengalaman:</span>
                    <p className="font-medium">{selectedParticipant.experience_years || 0} tahun</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Bahasa:</span>
                    <p className="font-medium">
                      {selectedParticipant.languages?.join(", ") || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                  <h3 className="text-lg font-semibold mb-2">{t('applications.title') || 'Applications'}</h3>
                {applications.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('applications.noApplications') || 'No applications yet'}</p>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <Card key={app.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{app.job.title}</p>
                              <p className="text-sm text-muted-foreground">{app.job.country}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(app.created_at).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                              <select
                                value={app.status}
                                onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                className="text-xs px-2 py-1 border rounded"
                              >
                                <option value="dikirim">Dikirim</option>
                                <option value="seleksi">Seleksi</option>
                                <option value="interview">Interview</option>
                                <option value="diterima">Diterima</option>
                                <option value="berangkat">Berangkat</option>
                                <option value="ditolak">Ditolak</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-medium">{t('notes.title') || 'Admin Notes'}</h4>
                              {(notesMap[app.id] || []).length === 0 ? (
                                <p className="text-xs text-muted-foreground">{t('notes.empty') || 'No admin notes.'}</p>
                              ) : (
                                <ul className="text-sm space-y-1 mt-2">
                                  {(notesMap[app.id] || []).map((n: any) => (
                                    <li key={n.id} className="border rounded px-2 py-1 flex justify-between items-start">
                                      <div>
                                        <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                                        <div className="font-medium">{n.profiles?.full_name || n.admin_id}</div>
                                        <div className="text-sm">{n.note}</div>
                                      </div>
                                      {isAdmin && (
                                        <div>
                                          <button
                                            className="text-xs text-red-600 ml-4"
                                            onClick={async () => {
                                              try {
                                                await deleteAdminNote(n.id);
                                                const fresh = await fetchNotes(app.id);
                                                setNotesMap(prev => ({ ...prev, [app.id]: fresh || [] }));
                                              } catch (e) {
                                                console.error(e);
                                              }
                                            }}
                                          >{t('common.delete') || 'Delete'}</button>
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <AdminNoteForm
                                applicationId={app.id}
                                onSaved={async () => {
                                  try {
                                    const fresh = await fetchNotes(app.id);
                                    setNotesMap(prev => ({ ...prev, [app.id]: fresh || [] }));
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageParticipants;
