import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ClientFaq } from "@/types/database";

/**
 * Para super_admin: carga FAQs de cualquier cliente por client_id.
 * Usa el service client para bypasear RLS.
 */
export async function getFaqsByClientId(
  clientId: string
): Promise<{ faqs: ClientFaq[]; error: Error | null }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("client_faqs")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return { faqs: (data ?? []) as ClientFaq[], error: error as Error | null };
}

/**
 * Para client_agent: carga las FAQs propias usando RLS.
 * El RLS de Supabase filtra automáticamente por auth.uid() → client_id.
 */
export async function getOwnClientFaqs(): Promise<{
  faqs: ClientFaq[];
  error: Error | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return { faqs: (data ?? []) as ClientFaq[], error: error as Error | null };
}
