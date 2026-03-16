"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Pause } from "lucide-react";
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        botPaused
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
          : "border-edge bg-surface-raised text-ink-3 hover:bg-canvas hover:text-ink-2"
      )}
    >
      {botPaused ? (
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      ) : (
        <Pause className="h-3 w-3" />
      )}
      {botPaused ? (
        loading ? "Activando..." : "Reactivar"
      ) : (
        loading ? "Pausando..." : "Pausar"
      )}
    </button>
  );
}
