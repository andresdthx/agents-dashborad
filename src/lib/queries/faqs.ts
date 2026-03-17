import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ClientFaq } from "@/types/database";
import type { PostgrestError } from "@supabase/postgrest-js";

type AppSupabaseClient = SupabaseClient<Database>;
type FaqInsert = Database["public"]["Tables"]["client_faqs"]["Insert"];
type FaqUpdate = Database["public"]["Tables"]["client_faqs"]["Update"];

export type { FaqInsert, FaqUpdate };

/**
 * Crea una nueva FAQ. Acepta el cliente de Supabase del browser (para mutaciones client-side).
 */
export async function createFaq(
  supabase: AppSupabaseClient,
  data: FaqInsert
): Promise<{ faq: ClientFaq | null; error: PostgrestError | null }> {
  const { data: faq, error } = await supabase
    .from("client_faqs")
    .insert(data)
    .select()
    .single();

  return { faq: faq as ClientFaq | null, error };
}

/**
 * Actualiza campos de una FAQ existente.
 */
export async function updateFaq(
  supabase: AppSupabaseClient,
  id: string,
  data: FaqUpdate
): Promise<{ faq: ClientFaq | null; error: PostgrestError | null }> {
  const { data: faq, error } = await supabase
    .from("client_faqs")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  return { faq: faq as ClientFaq | null, error };
}

/**
 * Elimina una FAQ permanentemente.
 */
export async function deleteFaq(
  supabase: AppSupabaseClient,
  id: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from("client_faqs")
    .delete()
    .eq("id", id);

  return { error };
}

/**
 * Activa o desactiva una FAQ (toggle is_active).
 */
export async function toggleFaqActive(
  supabase: AppSupabaseClient,
  id: string,
  is_active: boolean
): Promise<{ faq: ClientFaq | null; error: PostgrestError | null }> {
  return updateFaq(supabase, id, { is_active });
}
