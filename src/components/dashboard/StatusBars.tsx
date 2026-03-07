import Link from "next/link";

interface StatusBarsProps {
  statusCounts: {
    bot_active: number;
    human_active: number;
    resolved: number;
    lost: number;
  };
}

export function StatusBars({ statusCounts }: StatusBarsProps) {
  const { bot_active, human_active, resolved, lost } = statusCounts;

  const allEmpty = bot_active === 0 && human_active === 0 && resolved === 0 && lost === 0;

  if (allEmpty) {
    return (
      <div className="rounded-2xl border border-edge bg-surface-raised p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-ink-3">Sin conversaciones registradas aún</p>
        <p className="mt-1 text-xs text-ink-4">
          Las métricas de conversaciones aparecerán aquí cuando el bot comience a gestionar leads.
        </p>
      </div>
    );
  }

  const finalized = resolved + lost;
  const successRate = finalized > 0 ? Math.round((resolved / finalized) * 100) : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Bot activo */}
      <Link
        href="/dashboard/leads?status=bot_active"
        className="group rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-sm font-semibold text-ink">Agente activo</p>
        <p className="mt-0.5 text-xs text-ink-3">automatizadas activas</p>
        <p
          className="mt-4 font-mono text-3xl font-bold tabular-nums"
          style={{ color: "var(--color-bot-active)" }}
        >
          {bot_active.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">gestionados por IA</p>
        <p className="mt-3 text-xs font-medium text-signal opacity-0 transition-opacity group-hover:opacity-100">
          Ver conversaciones →
        </p>
      </Link>

      {/* Requieren atención humana */}
      {human_active > 0 ? (
        <Link
          href="/dashboard/leads?paused=true"
          className="group rounded-2xl border border-bot-paused/30 bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-ink">Requieren atención</p>
          <p className="mt-0.5 text-xs text-ink-3">intervención humana activa</p>
          <p className="mt-4 font-mono text-3xl font-bold tabular-nums text-bot-paused-text">
            {human_active.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-3">pendientes de atender</p>
          <p className="mt-3 text-xs font-medium text-signal opacity-0 transition-opacity group-hover:opacity-100">
            Atender ahora →
          </p>
        </Link>
      ) : (
        <div className="rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm">
          <p className="text-sm font-semibold text-ink">Requieren atención</p>
          <p className="mt-0.5 text-xs text-ink-3">intervención humana activa</p>
          <p className="mt-4 font-mono text-3xl font-bold tabular-nums text-ink">0</p>
          <p className="mt-1 text-xs text-ink-4">Sin pendientes</p>
        </div>
      )}

      {/* Resueltos */}
      <Link
        href="/dashboard/leads?status=resolved"
        className="group rounded-2xl border border-lead-warm/25 bg-lead-warm-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-sm font-semibold text-lead-warm-text">Resueltos</p>
        <p className="mt-0.5 text-xs text-lead-warm-text opacity-70">cerrados exitosamente</p>
        <p className="mt-4 font-mono text-3xl font-bold tabular-nums text-lead-warm-text">
          {resolved.toLocaleString()}
        </p>
        {successRate !== null && (
          <p className="mt-1 text-xs text-lead-warm-text opacity-70">
            {successRate}% tasa de éxito
          </p>
        )}
        <p className="mt-3 text-xs font-medium text-lead-warm-text opacity-0 transition-opacity group-hover:opacity-100">
          Ver resueltos →
        </p>
      </Link>

      {/* Perdidos */}
      <Link
        href="/dashboard/leads?status=lost"
        className="group rounded-2xl border border-lead-cold/25 bg-lead-cold-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-sm font-semibold text-lead-cold-text">Perdidos</p>
        <p className="mt-0.5 text-xs text-lead-cold-text opacity-70">sin conversión</p>
        <p className="mt-4 font-mono text-3xl font-bold tabular-nums text-lead-cold-text">
          {lost.toLocaleString()}
        </p>
        {successRate !== null && (
          <p className="mt-1 text-xs text-lead-cold-text opacity-70">
            {100 - successRate}% de bajas
          </p>
        )}
        <p className="mt-3 text-xs font-medium text-lead-cold-text opacity-0 transition-opacity group-hover:opacity-100">
          Ver perdidos →
        </p>
      </Link>
    </div>
  );
}
