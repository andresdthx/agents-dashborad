import Link from "next/link";
import { AlertCircle, Star, XCircle } from "lucide-react";

interface StatusBarsProps {
  statusCounts: {
    bot_active: number;
    human_active: number;
    resolved: number;
    lost: number;
  };
}

function ProportionBar({
  value,
  total,
  colorClass,
}: {
  value: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mt-3 space-y-1 border-t border-edge pt-3">
      <div className="flex items-center justify-between">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-current/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="ml-2 font-mono text-[10px] font-semibold tabular-nums text-ink-4">
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function StatusBars({ statusCounts }: StatusBarsProps) {
  const { bot_active, human_active, resolved, lost } = statusCounts;

  const total = bot_active + human_active + resolved + lost;
  const finalized = resolved + lost;
  const successRate = finalized > 0 ? Math.round((resolved / finalized) * 100) : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Agente activo */}
      <Link
        href="/dashboard/leads?status=bot_active"
        aria-label={`Agente activo: ${bot_active} conversaciones automatizadas`}
        className="group rounded-2xl bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-3">Agente activo</p>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-bot-active animate-pulse"
              aria-hidden="true"
            />
            <span className="text-[10px] font-semibold text-bot-active-text">Live</span>
          </div>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-ink">
          {bot_active.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">conversaciones activas</p>
        <ProportionBar value={bot_active} total={total} colorClass="bg-bot-active" />
      </Link>

      {/* Requieren atención humana */}
      {human_active > 0 ? (
        <Link
          href="/dashboard/leads?status=human_active"
          aria-label={`Requieren atención: ${human_active} conversaciones pendientes`}
          className="group rounded-2xl border border-bot-paused/30 bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-3">Requieren atención</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bot-paused/10">
              <AlertCircle className="h-3.5 w-3.5 text-bot-paused-text" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-bot-paused-text">
            {human_active.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-3">intervención humana activa</p>
          <ProportionBar value={human_active} total={total} colorClass="bg-bot-paused" />
        </Link>
      ) : (
        <div
          className="rounded-2xl bg-surface-raised p-5 shadow-sm"
          aria-label="Sin conversaciones que requieran atención humana"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-3">Requieren atención</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-overlay">
              <AlertCircle className="h-3.5 w-3.5 text-ink-4" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-ink">0</p>
          <p className="mt-1 text-xs text-ink-3">intervención humana activa</p>
          <div className="mt-3 border-t border-edge pt-3">
            <p className="text-xs font-medium text-bot-active-text">Sin pendientes</p>
          </div>
        </div>
      )}

      {/* Resueltos */}
      <Link
        href="/dashboard/leads?status=resolved"
        aria-label={`Resueltos: ${resolved} conversaciones cerradas exitosamente`}
        className="group rounded-2xl border border-bot-active/25 bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-bot-active-text">Resueltos</p>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bot-active/10">
            <Star className="h-3.5 w-3.5 text-bot-active-text" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-ink">
          {resolved.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">cerradas exitosamente</p>
        <div className="mt-3 space-y-1 border-t border-bot-active/15 pt-3">
          <div className="flex items-center justify-between">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bot-active/10">
              <div
                className="h-full rounded-full bg-bot-active transition-all duration-700"
                style={{ width: `${total > 0 ? Math.round((resolved / total) * 100) : 0}%` }}
              />
            </div>
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-bot-active-text">
              {successRate !== null ? `${successRate}% éxito` : "—"}
            </span>
          </div>
        </div>
      </Link>

      {/* Perdidas */}
      <Link
        href="/dashboard/leads?status=lost"
        aria-label={`Perdidas: ${lost} conversaciones sin conversión`}
        className="group rounded-2xl border border-lead-cold/25 bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-lead-cold-text">Perdidas</p>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lead-cold/10">
            <XCircle className="h-3.5 w-3.5 text-lead-cold-text" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-ink">
          {lost.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">sin respuesta</p>
        <div className="mt-3 space-y-1 border-t border-lead-cold/15 pt-3">
          <div className="flex items-center justify-between">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lead-cold/10">
              <div
                className="h-full rounded-full bg-lead-cold transition-all duration-700"
                style={{ width: `${total > 0 ? Math.round((lost / total) * 100) : 0}%` }}
              />
            </div>
            <span className="ml-2 text-[10px] font-semibold text-lead-cold-text">
              {successRate !== null ? `${100 - successRate}% bajas` : "—"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
