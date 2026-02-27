"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  leadId: string;
  botPaused: boolean;
  botPausedReason: string | null;
  status: "bot_active" | "human_active" | "resolved" | "lost";
}

export function BotToggleButton({ leadId, botPaused, botPausedReason, status }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/bot-pause`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_paused: !botPaused,
          reason: !botPaused ? "manual_pause" : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Error al actualizar el bot");
      }

      toast.success(botPaused ? "Agente reactivado" : "Agente pausado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {/* State indicator */}
        {status === "human_active" ? (
          <div className="flex items-center gap-2 rounded-md border border-bot-paused/25 bg-bot-paused-surface px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bot-paused opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-bot-paused" />
            </span>
            <span className="text-sm font-medium text-bot-paused-text">Atención humana</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md border border-bot-active/25 bg-bot-active-surface px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-bot-active" />
            <span className="text-sm font-medium text-bot-active-text">Agente activo</span>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={toggle}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            botPaused
              ? "border-bot-active/30 bg-bot-active-surface text-bot-active-text hover:bg-bot-active/20"
              : "border-edge bg-surface-raised text-ink-2 hover:bg-surface hover:text-ink"
          )}
        >
          {botPaused ? (
            <>
              <Play className="h-3.5 w-3.5" />
              {loading ? "Activando..." : "Reactivar"}
            </>
          ) : (
            <>
              <PauseCircle className="h-3.5 w-3.5" />
              {loading ? "Pausando..." : "Pausar agente"}
            </>
          )}
        </button>
      </div>

      {botPaused && botPausedReason && (
        <p className="text-xs text-ink-3">
          Razón: <span className="text-ink-2">{botPausedReason}</span>
        </p>
      )}
    </div>
  );
}
