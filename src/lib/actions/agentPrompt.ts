"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { validatePromptContent } from "@/lib/utils/promptValidation";

// Bloque que el cliente no debe ver ni alterar — se preserva al guardar.
const DATOS_INYECTADOS_RE = /<DatosInyectados>[\s\S]*?<\/DatosInyectados>/gi;
// Bloques que la Edge Function inyecta en tiempo real — no deben persistirse en BD.
const BLOQUE_HANDOFF_RE = /<BloqueHandoff>[\s\S]*?<\/BloqueHandoff>/gi;
const BLOQUE_RESERVA_RE = /<BloqueReserva>[\s\S]*?<\/BloqueReserva>/gi;
// Bloques de datos crudos RESERVA_INICIO/FIN que el cliente haya hardcodeado manualmente.
// La Edge Function los inyecta desde client_reservation_config — duplicarlos rompe el prompt.
const RESERVA_BLOQUE_RAW_RE = /RESERVA_INICIO[\s\S]*?RESERVA_FIN/g;

function stripSystemBlocks(content: string): string {
  return content
    .replace(DATOS_INYECTADOS_RE, "")
    .replace(BLOQUE_HANDOFF_RE, "")
    .replace(BLOQUE_RESERVA_RE, "")
    .replace(RESERVA_BLOQUE_RAW_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractDatosInyectados(content: string): string | null {
  const re = new RegExp(DATOS_INYECTADOS_RE.source, "i");
  return content.match(re)?.[0] ?? null;
}

/**
 * Guarda el prompt del agente de ventas de un cliente.
 *
 * Seguridad / bloques del sistema:
 * - <DatosInyectados> original (si existía en BD) se re-inserta al final.
 * - <BloqueHandoff> no se persiste — la Edge Function lo inyecta en tiempo real.
 * - <BloqueReserva> no se persiste — la Edge Function lo inyecta desde client_reservation_config.
 * - RESERVA_INICIO...RESERVA_FIN hardcodeados se eliminan para evitar duplicación con
 *   el bloque inyectado en runtime por la Edge Function.
 */
export async function saveAgentPrompt(input: {
  clientId: string;
  promptId: string | null;
  userContent: string;
}): Promise<{ promptId: string | null; error: string | null }> {
  const { clientId, promptId, userContent } = input;
  const supabase = createServiceClient();

  // 1. Strip cualquier bloque del sistema que venga del cliente
  const sanitizedUserContent = stripSystemBlocks(userContent);

  // 2. Validar tokens reservados (case-sensitive) — después del strip para no
  //    generar falsos positivos con bloques XML que ya fueron eliminados
  const validation = validatePromptContent(sanitizedUserContent);
  if (!validation.valid) {
    return { promptId: promptId ?? null, error: validation.error };
  }

  // 3. Obtener <DatosInyectados> original desde BD (si existe) para re-insertarlo
  let datosInyectados: string | null = null;
  if (promptId) {
    const { data } = await supabase
      .from("agent_prompts")
      .select("content")
      .eq("id", promptId)
      .single();

    if (data?.content) {
      datosInyectados = extractDatosInyectados(data.content);
    }
  }

  // 4. Reconstruir: contenido del usuario + <DatosInyectados> al final (si existía)
  const finalContent = datosInyectados
    ? `${sanitizedUserContent}\n\n${datosInyectados}`
    : sanitizedUserContent;

  // 5. Guardar
  if (promptId) {
    const { error } = await supabase
      .from("agent_prompts")
      .update({ content: finalContent, updated_at: new Date().toISOString() })
      .eq("id", promptId);

    if (error) return { promptId, error: error.message };
    return { promptId, error: null };
  }

  // Crear prompt nuevo y enlazarlo al cliente
  const { data: prompt, error: insertError } = await supabase
    .from("agent_prompts")
    .insert({
      name: "Sales Agent",
      content: finalContent,
      agent_type: "sales",
      client_id: clientId,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) return { promptId: null, error: insertError.message };

  const { error: linkError } = await supabase
    .from("clients")
    .update({ sales_prompt_id: prompt.id })
    .eq("id", clientId);

  if (linkError) return { promptId: prompt.id, error: linkError.message };

  return { promptId: prompt.id, error: null };
}
