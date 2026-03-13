"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { saveAgentPrompt } from "@/lib/actions/agentPrompt";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Límites de caracteres por plan — provisionales hasta que los planes estén definidos.
// Actualizar estos valores cuando se formalicen los tiers.
export const PLAN_PROMPT_LIMITS: Record<string, number> = {
  basico: 10_000,
  pro: 10_000,
  max: 10_000,
};
export const DEFAULT_PROMPT_LIMIT = 10_000;

// Bloques del sistema que el cliente no debe ver ni editar.
const SYSTEM_BLOCK_RES = [
  /<DatosInyectados>[\s\S]*?<\/DatosInyectados>/gi,
  /<BloqueHandoff>[\s\S]*?<\/BloqueHandoff>/gi,
];

/** Elimina los bloques del sistema del contenido antes de mostrarlo al cliente. */
function stripSystemBlocks(content: string): string {
  let result = content;
  for (const re of SYSTEM_BLOCK_RES) {
    result = result.replace(re, "");
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

interface Props {
  clientId: string;
  /** ID del registro existente en agent_prompts (null = aún no tiene prompt). */
  promptId?: string | null;
  /** Contenido actual del prompt (incluye <DatosInyectados> si existe). */
  initialContent?: string;
  /** Nombre del plan del cliente, ej: "basico" | "pro" | "max". */
  planName?: string | null;
}

export function AgentPromptEditor({
  clientId,
  promptId: initialPromptId,
  initialContent = "",
  planName,
}: Props) {
  // El textarea solo muestra el contenido sin los bloques sensibles del sistema
  const [content, setContent] = useState(() => stripSystemBlocks(initialContent));
  const [saving, setSaving] = useState(false);
  const promptIdRef = useRef<string | null>(initialPromptId ?? null);

  const limit = PLAN_PROMPT_LIMITS[planName ?? ""] ?? DEFAULT_PROMPT_LIMIT;
  const count = content.length;
  const overLimit = count > limit;
  const pct = Math.min((count / limit) * 100, 100);

  // Prevenir que el usuario pegue bloques del sistema en el textarea
  function handleChange(value: string) {
    setContent(stripSystemBlocks(value));
  }

  async function handleSave() {
    if (overLimit) return;
    setSaving(true);

    try {
      const { promptId: savedId, error } = await saveAgentPrompt({
        clientId,
        promptId: promptIdRef.current,
        userContent: content,
      });

      if (error) throw new Error(error);

      if (savedId && !promptIdRef.current) {
        promptIdRef.current = savedId;
      }

      toast.success("Prompt guardado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-1/2 flex flex-col gap-3 h-[calc(100vh-240px)]">
      {/* Textarea ocupa el espacio disponible y hace scroll internamente */}
      <Textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Eres un agente de ventas de [negocio]. Tu objetivo es ayudar a los clientes a encontrar el producto ideal, responder dudas y guiarlos hacia una compra..."
        className="flex-1 min-h-0 font-mono text-sm resize-none overflow-y-auto"
      />

      {/* Controles siempre visibles — no dependen del scroll */}
      <div className="flex-shrink-0 border-t border-edge pt-3 pb-1 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-ink-4">
              {planName
                ? `Plan ${planName} · límite ${limit.toLocaleString()} caracteres`
                : `Límite ${limit.toLocaleString()} caracteres`}
            </span>
            <span
              className={cn(
                "text-xs tabular-nums font-medium",
                overLimit
                  ? "text-destructive"
                  : count / limit > 0.85
                  ? "text-amber-500"
                  : "text-ink-4"
              )}
            >
              {count.toLocaleString()} / {limit.toLocaleString()}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-surface-raised overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                overLimit ? "bg-destructive" : pct > 85 ? "bg-amber-500" : "bg-signal"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {overLimit && (
            <p className="text-xs text-destructive">
              Excede el límite de tu plan en {(count - limit).toLocaleString()} caracteres.
              {planName === "basico" && " Actualiza al Plan Pro para ampliar el límite."}
              {planName === "pro" && " Actualiza al Plan Max para ampliar el límite."}
            </p>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving || overLimit || count === 0}>
          {saving ? "Guardando..." : "Guardar prompt"}
        </Button>
      </div>
    </div>
  );
}
