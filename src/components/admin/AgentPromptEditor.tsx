"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Límites de caracteres por plan — provisionales hasta que los planes estén definidos.
// Actualizar estos valores cuando se formalicen los tiers.
export const PLAN_PROMPT_LIMITS: Record<string, number> = {
  basico: 3_000,
  pro: 8_000,
  max: 20_000,
};
export const DEFAULT_PROMPT_LIMIT = 3_000;

interface Props {
  clientId: string;
  /** ID del registro existente en agent_prompts (null = aún no tiene prompt). */
  promptId?: string | null;
  /** Contenido actual del prompt. */
  initialContent?: string;
  /** Nombre del plan del cliente, ej: "basico" | "pro" | "max". */
  planName?: string | null;
}

export function AgentPromptEditor({
  clientId,
  promptId,
  initialContent = "",
  planName,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const limit = PLAN_PROMPT_LIMITS[planName ?? ""] ?? DEFAULT_PROMPT_LIMIT;
  const count = content.length;
  const overLimit = count > limit;
  const pct = Math.min((count / limit) * 100, 100);

  async function handleSave() {
    if (overLimit) return;
    setSaving(true);
    const supabase = getBrowserClient();

    try {
      if (promptId) {
        const { error } = await supabase
          .from("agent_prompts")
          .update({ content, updated_at: new Date().toISOString() })
          .eq("id", promptId);
        if (error) throw error;
      } else {
        // Crear prompt nuevo y enlazarlo al cliente
        const { data: prompt, error: insertError } = await supabase
          .from("agent_prompts")
          .insert({
            name: "Sales Agent",
            content,
            agent_type: "sales",
            client_id: clientId,
            is_active: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const { error: linkError } = await supabase
          .from("clients")
          .update({ sales_prompt_id: prompt.id })
          .eq("id", clientId);

        if (linkError) throw linkError;
      }

      toast.success("Prompt guardado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Eres un agente de ventas de [negocio]. Tu objetivo es ayudar a los clientes a encontrar el producto ideal, responder dudas y guiarlos hacia una compra..."
        rows={14}
        className="font-mono text-sm resize-y"
      />

      {/* Barra de progreso de caracteres */}
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
              overLimit ? "text-destructive" : count / limit > 0.85 ? "text-amber-500" : "text-ink-4"
            )}
          >
            {count.toLocaleString()} / {limit.toLocaleString()}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-surface-raised overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              overLimit
                ? "bg-destructive"
                : pct > 85
                ? "bg-amber-500"
                : "bg-signal"
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
  );
}
