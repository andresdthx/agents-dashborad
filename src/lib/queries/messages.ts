import { createClient } from "@/lib/supabase/server";

export async function getMessagesByLeadId(leadId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  return { messages: data ?? [], error };
}
