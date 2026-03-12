"use server";

import { createServiceClient } from "@/lib/supabase/service";
import type { ClientHandoff } from "@/lib/queries/handoffs";

// ── Generación del bloque ─────────────────────────────────────────────────────

function buildHandoffBlock(handoffs: ClientHandoff[]): string {
  const clientRulesLines = handoffs
    .map((h) => {
      const base = `- ${h.trigger} → urgente: ${h.urgent}`;
      return h.response?.trim() ? `${base}; respuesta: ${h.response.trim()}` : base;
    })
    .join("\n");

  const clientRulesSection =
    handoffs.length > 0
      ? `\n\n<ReglasCliente>\n${clientRulesLines}\n</ReglasCliente>`
      : "";

  return `<BloqueHandoff>
El bloque HANDOFF transfiere la conversación al equipo humano. Emítelo cuando se cumplan las condiciones definidas a continuación y cuando el cliente exija hablar con una persona.${clientRulesSection}

**Formato (uso interno — nunca lo expliques al cliente):**

HANDOFF_INICIO
motivo: [descripción del motivo]
urgente: [true | false]
HANDOFF_FIN

**Reglas de emisión:**
1. Muestra primero el mensaje al cliente, luego el bloque — nunca el bloque solo.
2. Emite el bloque inmediatamente al detectar el trigger, sin esperar confirmación.
3. No sigas procesando la solicitud después del bloque. El equipo retoma.
4. \`urgente: true\` → "Te comunico ahora con alguien del equipo."
5. \`urgente: false\` → "Eso lo tiene que revisar el equipo. Te paso con ellos."

**Cuándo usar \`urgente: true\`:** el cliente se muestra frustrado, agresivo o exige
atención humana de inmediato.
</BloqueHandoff>`;
}

const HANDOFF_BLOCK_RE = /<BloqueHandoff>[\s\S]*?<\/BloqueHandoff>/i;

/**
 * Lee todas las reglas de client_handoffs del cliente y regenera el
 * <BloqueHandoff> en agent_prompts. Se llama después de cada operación CRUD.
 */
export async function regenerateHandoffBlock(
  clientId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceClient();

  // 1. Leer reglas desde la tabla
  const { data: handoffs, error: fetchError } = await supabase
    .from("client_handoffs")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (fetchError) return { error: fetchError.message };

  // 2. Obtener el prompt activo del cliente
  const { data: prompt, error: promptError } = await supabase
    .from("agent_prompts")
    .select("id, content")
    .eq("client_id", clientId)
    .eq("agent_type", "sales")
    .eq("is_active", true)
    .single();

  const newBlock = buildHandoffBlock((handoffs ?? []) as ClientHandoff[]);

  if (promptError || !prompt) {
    // Sin prompt existente: crear uno con solo el bloque
    const { data: created, error: insertError } = await supabase
      .from("agent_prompts")
      .insert({
        name: "Sales Agent",
        content: newBlock,
        agent_type: "sales",
        client_id: clientId,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) return { error: insertError.message };

    await supabase
      .from("clients")
      .update({ sales_prompt_id: created.id })
      .eq("id", clientId);

    return { error: null };
  }

  // 3. Reemplazar (o añadir) el bloque en el prompt existente
  const updatedContent = HANDOFF_BLOCK_RE.test(prompt.content)
    ? prompt.content.replace(HANDOFF_BLOCK_RE, newBlock)
    : `${prompt.content.trim()}\n\n${newBlock}`;

  const { error: updateError } = await supabase
    .from("agent_prompts")
    .update({ content: updatedContent, updated_at: new Date().toISOString() })
    .eq("id", prompt.id);

  return { error: updateError?.message ?? null };
}
