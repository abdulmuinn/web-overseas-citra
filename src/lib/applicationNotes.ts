import { supabase } from "@/integrations/supabase/client";

export async function addAdminNote(applicationId: string, note: string) {
  // get current user id to set as admin_id
  const userRes = await supabase.auth.getUser();
  const user = userRes.data?.user;
  if (userRes.error) throw userRes.error;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("application_notes")
    .insert([
      { application_id: applicationId, note, admin_id: user.id },
    ])
    .select();

  if (error) throw error;
  return data;
}

export async function fetchNotes(applicationId: string) {
  // select notes and include admin profile username
  const { data, error } = await supabase
    .from("application_notes")
    // use profile relationship without inner join to avoid accidentally filtering rows
    .select(`id, note, admin_id, created_at, profiles(id, full_name, email)`)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  // debug log so you can inspect response in browser console
  if (error) {
    console.error("fetchNotes error:", error);
  } else {
    console.debug("fetchNotes result:", data);
  }

  if (error) throw error;
  return data;
}

export async function deleteAdminNote(noteId: string) {
  const { data, error } = await supabase
    .from("application_notes")
    .delete()
    .eq("id", noteId)
    .select();

  if (error) throw error;
  return data;
}
