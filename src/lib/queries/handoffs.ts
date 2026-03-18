import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { PostgrestError } from "@supabase/postgrest-js";

type AppSupabaseClient = SupabaseClient<Database>;

export interface ClientHandoff {
  id: string;
  client_id: string;
  trigger: string;
  urgent: boolean;
  response: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function createHandoff(
  supabase: AppSupabaseClient,
  data: { client_id: string; trigger: string; urgent: boolean; response?: string; sort_order: number }
): Promise<{ handoff: ClientHandoff | null; error: PostgrestError | null }> {
  const { data: handoff, error } = await supabase
    .from("client_handoffs")
    .insert(data)
    .select()
    .single();
  return { handoff: handoff as ClientHandoff | null, error };
}

export async function updateHandoff(
  supabase: AppSupabaseClient,
  id: string,
  data: Partial<{ trigger: string; urgent: boolean; response: string | null; sort_order: number }>
): Promise<{ handoff: ClientHandoff | null; error: PostgrestError | null }> {
  const { data: handoff, error } = await supabase
    .from("client_handoffs")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { handoff: handoff as ClientHandoff | null, error };
}

export async function deleteHandoff(
  supabase: AppSupabaseClient,
  id: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.from("client_handoffs").delete().eq("id", id);
  return { error };
}
