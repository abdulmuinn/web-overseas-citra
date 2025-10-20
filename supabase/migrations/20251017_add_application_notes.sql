-- ...existing code...
CREATE TABLE IF NOT EXISTS application_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles(id),
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- hapus policy lama jika ada
DROP POLICY IF EXISTS "Admins can insert notes" ON application_notes;
DROP POLICY IF EXISTS "Admins and owner can select" ON application_notes;
DROP POLICY IF EXISTS "Admins can delete notes" ON application_notes;

-- Insert policy harus pakai WITH CHECK
CREATE POLICY "Admins can insert notes"
  ON application_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Select policy (USING benar)
CREATE POLICY "Admins and owner can select"
  ON application_notes
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (
      SELECT 1 FROM applications a WHERE a.id = application_notes.application_id
        AND a.user_id = auth.uid()
    )
  );

-- Delete policy (USING benar)
CREATE POLICY "Admins can delete notes"
  ON application_notes
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
-- ...existing code...