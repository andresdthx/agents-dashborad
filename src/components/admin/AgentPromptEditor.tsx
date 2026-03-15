"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { saveAgentPrompt } from "@/lib/actions/agentPrompt";
import { validatePromptContent } from "@/lib/utils/promptValidation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Tag } from "lucide-react";

export const PLAN_PROMPT_LIMITS: Record<string, number> = {
  basico: 10_000,
  pro: 10_000,
  max: 10_000,
};
export const DEFAULT_PROMPT_LIMIT = 10_000;

const SYSTEM_BLOCK_RES = [
  /<DatosInyectados>[\s\S]*?<\/DatosInyectados>/gi,
  /<BloqueHandoff>[\s\S]*?<\/BloqueHandoff>/gi,
  /<BloqueReserva>[\s\S]*?<\/BloqueReserva>/gi,
  /RESERVA_INICIO[\s\S]*?RESERVA_FIN/g,
];

function detectVariables(content: string): string[] {
  const seen = new Set<string>();
  for (const m of content.matchAll(/\[([^\]\n]{1,60})\]/g)) {
    seen.add(m[1].trim());
  }
  return Array.from(seen);
}

interface DetectedBlock {
  name: string;
  paired: boolean; // false = missing opening or closing tag
}

function detectBlocks(content: string): DetectedBlock[] {
  const opening = new Set<string>();
  const closing = new Set<string>();

  for (const m of content.matchAll(/<([a-zA-ZÀ-ú_][a-zA-ZÀ-ú0-9_\-\s]{0,40}?)>/g)) {
    opening.add(m[1].trim());
  }
  for (const m of content.matchAll(/<\/([a-zA-ZÀ-ú_][a-zA-ZÀ-ú0-9_\-\s]{0,40}?)>/g)) {
    closing.add(m[1].trim());
  }

  const IGNORED = new Set(["ContextoNegocio"]);
  const all = new Set([...opening, ...closing].filter((n) => !IGNORED.has(n)));
  return Array.from(all).map((name) => ({
    name,
    paired: opening.has(name) && closing.has(name),
  }));
}

function stripSystemBlocks(content: string): string {
  let result = content;
  for (const re of SYSTEM_BLOCK_RES) {
    result = result.replace(re, "");
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

interface Props {
  clientId: string;
  promptId?: string | null;
  initialContent?: string;
  planName?: string | null;
}

export function AgentPromptEditor({
  clientId,
  promptId: initialPromptId,
  initialContent = "",
  planName,
}: Props) {
  const [content, setContent] = useState(() => stripSystemBlocks(initialContent));
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const promptIdRef = useRef<string | null>(initialPromptId ?? null);

  const limit = PLAN_PROMPT_LIMITS[planName ?? ""] ?? DEFAULT_PROMPT_LIMIT;
  const count = content.length;
  const overLimit = count > limit;
  const pct = Math.min((count / limit) * 100, 100);
  const isWarning = !overLimit && count / limit > 0.85;

  function handleChange(value: string) {
    const stripped = stripSystemBlocks(value);
    setContent(stripped);
    const result = validatePromptContent(stripped);
    setValidationError(result.valid ? null : result.error);
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
    <div className="flex h-full max-w-3xl flex-col">
      {/* Info banner */}
      <div className="shrink-0 mb-4 flex items-start gap-3 rounded-xl border border-edge bg-surface-raised px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-ink">Instrucciones del agente</p>
          <p className="text-xs text-ink-3 leading-relaxed">
            Define la personalidad, objetivos y restricciones de tu agente. Sé específico: menciona el nombre del negocio, productos, tono de comunicación y límites de la conversación.
          </p>
        </div>
        {planName && (
          <span className="ml-auto shrink-0 rounded-full border border-edge px-2.5 py-0.5 text-[11px] font-medium text-ink-3 whitespace-nowrap">
            Plan {planName}
          </span>
        )}
      </div>

      {/* Tags detectados */}
      {(detectVariables(content).length > 0 || detectBlocks(content).length > 0) && (
        <div className="shrink-0 mb-4 rounded-xl border border-edge bg-surface-raised px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden="true" />
            <p className="text-xs font-medium text-ink-3">Contenido detectado en el prompt</p>
          </div>

          {detectVariables(content).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Variables por completar</p>
              <div className="flex flex-wrap gap-1.5">
                {detectVariables(content).map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                  >
                    [{v}]
                  </span>
                ))}
              </div>
            </div>
          )}

          {detectBlocks(content).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Bloques de instrucción</p>
              <div className="flex flex-wrap gap-1.5">
                {detectBlocks(content).map((b) => (
                  <span
                    key={b.name}
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      b.paired
                        ? "border-blue-400/40 bg-blue-400/10 text-blue-700 dark:text-blue-400"
                        : "border-destructive/40 bg-destructive/10 text-destructive"
                    )}
                    title={!b.paired ? (
                      !content.includes(`<${b.name}>`)
                        ? `Falta la etiqueta de apertura <${b.name}>`
                        : `Falta la etiqueta de cierre </${b.name}>`
                    ) : undefined}
                  >
                    {b.paired
                      ? `<${b.name}></${b.name}>`
                      : !content.includes(`<${b.name}>`)
                        ? `</${b.name}>`
                        : `<${b.name}>`
                    }
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor — ocupa el espacio restante */}
      <div className="min-h-0 flex-1 rounded-t-xl border border-b-0 border-edge bg-surface-raised">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={"Eres un agente de ventas de [negocio]. Tu objetivo es ayudar a los clientes a encontrar el producto ideal, responder dudas y guiarlos hacia una compra.\n\nTono: amable, profesional y conciso.\nIdioma: español.\nLímites: no discutas precios fuera del catálogo..."}
          className="h-full rounded-none border-0 bg-transparent font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-4"
          aria-label="Instrucciones del agente"
        />
      </div>

      {/* Footer — siempre al fondo, pegado al editor */}
      <div className="shrink-0 rounded-b-xl border border-edge bg-canvas px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-surface-raised overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  overLimit ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-signal"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={cn(
                "shrink-0 text-xs tabular-nums font-medium",
                overLimit ? "text-destructive" : isWarning ? "text-amber-500" : "text-ink-4"
              )}
            >
              {count.toLocaleString()} / {limit.toLocaleString()}
            </span>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || overLimit || count === 0 || !!validationError}
            size="sm"
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {overLimit && (
          <p className="mt-2 text-xs text-destructive">
            Excede el límite en {(count - limit).toLocaleString()} caracteres.
            {planName === "basico" && " Actualiza al Plan Pro para ampliar el límite."}
            {planName === "pro" && " Actualiza al Plan Max para ampliar el límite."}
          </p>
        )}
        {validationError && !overLimit && (
          <p className="mt-2 text-xs text-destructive">{validationError}</p>
        )}
      </div>
    </div>
  );
}
