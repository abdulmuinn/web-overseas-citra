import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { addAdminNote } from "@/lib/applicationNotes";

export default function AdminNoteForm({ applicationId, onSaved }: { applicationId: string; onSaved?: () => void }) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      setLoading(true);
      await addAdminNote(applicationId, note.trim());
      setNote("");
      onSaved?.();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan catatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('adminNote.placeholder')}
        rows={4}
        className="w-full rounded border px-3 py-2"
      />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? t('adminNote.saving') : t('adminNote.save')}
        </button>
      </div>
    </form>
  );
}
