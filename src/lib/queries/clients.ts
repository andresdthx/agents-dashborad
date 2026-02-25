import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function getClients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, business_type, active, channel_phone_number, product_mode, plan_id, created_at")
    .order("created_at", { ascending: false });

  return { clients: data ?? [], error };
}

export async function getClientById(id: string) {
  const supabase = await createClient();

  // Two separate queries to avoid join type inference issues
  const [{ data: client, error }, { data: prompts }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("agent_prompts")
      .select("id, content, agent_type, is_active")
      .eq("client_id", id)
      .eq("agent_type", "sales"),
  ]);

  return {
    client: client
      ? { ...client, agent_prompts: prompts ?? [] }
      : null,
    error,
  };
}

export async function getPlans() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, display_name, price_usd")
    .eq("is_active", true)
    .order("price_usd", { ascending: true });

  return { plans: data ?? [], error };
}

export async function createClientRecord(
  input: Database["public"]["Tables"]["clients"]["Insert"]
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert(input)
    .select()
    .single();

  return { client: data, error };
}

export async function updateClientRecord(
  id: string,
  input: Database["public"]["Tables"]["clients"]["Update"]
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { client: data, error };
}
