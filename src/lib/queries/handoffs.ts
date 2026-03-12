// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

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
  supabase: SupabaseClient,
  data: { client_id: string; trigger: string; urgent: boolean; response?: string; sort_order: number }
): Promise<{ handoff: ClientHandoff | null; error: Error | null }> {
  const { data: handoff, error } = await supabase
    .from("client_handoffs")
    .insert(data)
    .select()
    .single();
  return { handoff: handoff as ClientHandoff | null, error: error as Error | null };
}

export async function updateHandoff(
  supabase: SupabaseClient,
  id: string,
  data: Partial<{ trigger: string; urgent: boolean; response: string | null; sort_order: number }>
): Promise<{ handoff: ClientHandoff | null; error: Error | null }> {
  const { data: handoff, error } = await supabase
    .from("client_handoffs")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { handoff: handoff as ClientHandoff | null, error: error as Error | null };
}

export async function deleteHandoff(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("client_handoffs").delete().eq("id", id);
  return { error: error as Error | null };
}
