import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchNotes } from "@/lib/applicationNotes";

export default function ApplicationNotesList({ applicationId }: { applicationId: string }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes(applicationId);
      setNotes(data ?? []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat catatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (applicationId) load(); }, [applicationId]);

  if (loading) return <div>{t('notes.loading')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!notes || notes.length === 0) return <div className="text-sm text-muted-foreground">{t('notes.empty')}</div>;

  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n.id} className="p-3 border rounded">
          <div className="text-sm text-gray-600">{new Date(n.created_at).toLocaleString()}</div>
          <div className="mt-1">{n.note}</div>
          <div className="mt-2 text-xs text-gray-500">{t('notes.by')}: {n.profiles?.full_name ?? n.admin_id}</div>
        </li>
      ))}
    </ul>
  );
}
