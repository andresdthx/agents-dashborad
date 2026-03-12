import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database, ClientFaq } from "@/types/database";

type FaqInsert = Database["public"]["Tables"]["client_faqs"]["Insert"];
type FaqUpdate = Database["public"]["Tables"]["client_faqs"]["Update"];

export type { FaqInsert, FaqUpdate };

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

/**
 * Crea una nueva FAQ. Acepta el cliente de Supabase del browser (para mutaciones client-side).
 */
export async function createFaq(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  data: FaqInsert
): Promise<{ faq: ClientFaq | null; error: Error | null }> {
  const { data: faq, error } = await supabase
    .from("client_faqs")
    .insert(data)
    .select()
    .single();

  return { faq: faq as ClientFaq | null, error: error as Error | null };
}

/**
 * Actualiza campos de una FAQ existente.
 */
export async function updateFaq(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string,
  data: FaqUpdate
): Promise<{ faq: ClientFaq | null; error: Error | null }> {
  const { data: faq, error } = await supabase
    .from("client_faqs")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  return { faq: faq as ClientFaq | null, error: error as Error | null };
}

/**
 * Elimina una FAQ permanentemente.
 */
export async function deleteFaq(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("client_faqs")
    .delete()
    .eq("id", id);

  return { error: error as Error | null };
}

/**
 * Activa o desactiva una FAQ (toggle is_active).
 */
export async function toggleFaqActive(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string,
  is_active: boolean
): Promise<{ faq: ClientFaq | null; error: Error | null }> {
  return updateFaq(supabase, id, { is_active });
}
