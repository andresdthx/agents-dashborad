"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  leadId: string;
  botPaused: boolean;
}

export function BotToggleButton({ leadId, botPaused }: Props) {
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
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        botPaused
          ? "border-bot-active/30 bg-bot-active-surface text-bot-active-text hover:bg-bot-active/20"
          : "border-edge bg-surface-raised text-ink-2 hover:bg-surface hover:text-ink"
      )}
    >
      {botPaused ? (
        <>
          <Play className="h-3 w-3" />
          {loading ? "Activando..." : "Reactivar"}
        </>
      ) : (
        <>
          <PauseCircle className="h-3 w-3" />
          {loading ? "Pausando..." : "Pausar"}
        </>
      )}
    </button>
  );
}
