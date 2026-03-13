import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ClientHandoff } from "./handoffs";

export async function getHandoffsByClientId(
  clientId: string
): Promise<{ handoffs: ClientHandoff[]; error: Error | null }> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("client_handoffs")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return { handoffs: (data ?? []) as ClientHandoff[], error: error as Error | null };
}

export async function getOwnClientHandoffs(): Promise<{
  handoffs: ClientHandoff[];
  error: Error | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_handoffs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return { handoffs: (data ?? []) as ClientHandoff[], error: error as Error | null };
}
