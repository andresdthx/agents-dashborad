"use server";

import { createServiceClient } from "@/lib/supabase/service";

// Bloques del sistema que el cliente no debe ver ni alterar.
const SYSTEM_BLOCK_RES = [
  /<DatosInyectados>[\s\S]*?<\/DatosInyectados>/gi,
  /<BloqueHandoff>[\s\S]*?<\/BloqueHandoff>/gi,
];

function stripSystemBlocks(content: string): string {
  let result = content;
  for (const re of SYSTEM_BLOCK_RES) {
    result = result.replace(re, "");
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Extrae todos los bloques del sistema de un prompt y los retorna en orden.
 * El orden de aparición original se preserva para reconstruir el prompt correctamente.
 */
function extractSystemBlocks(content: string): Array<{ block: string; index: number }> {
  const blocks: Array<{ block: string; index: number }> = [];
  for (const re of SYSTEM_BLOCK_RES) {
    const reClone = new RegExp(re.source, re.flags.replace("g", "") + "i");
    const match = content.match(reClone);
    if (match) {
      blocks.push({ block: match[0], index: content.indexOf(match[0]) });
    }
  }
  // Ordenar por posición original para re-insertar al final en el mismo orden
  return blocks.sort((a, b) => a.index - b.index);
}

/**
 * Guarda el prompt del agente de ventas de un cliente.
 *
 * Seguridad:
 * - Cualquier bloque del sistema (<DatosInyectados>, <BloqueHandoff>) que el cliente
 *   haya enviado es ignorado.
 * - Los bloques originales (si existían en BD) se re-insertan al final en su orden original.
 * - Esto garantiza que los bloques nunca desaparezcan y el cliente nunca pueda alterarlos.
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

  // 2. Obtener los bloques originales desde BD (solo si ya existe el prompt)
  let originalBlocks: Array<{ block: string; index: number }> = [];
  if (promptId) {
    const { data } = await supabase
      .from("agent_prompts")
      .select("content")
      .eq("id", promptId)
      .single();

    if (data?.content) {
      originalBlocks = extractSystemBlocks(data.content);
    }
  }

  // 3. Reconstruir: contenido del usuario + bloques originales al final (en orden)
  const blocksText = originalBlocks.map((b) => b.block).join("\n\n");
  const finalContent = blocksText
    ? `${sanitizedUserContent}\n\n${blocksText}`
    : sanitizedUserContent;

  // 4. Guardar
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
