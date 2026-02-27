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

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Bot activo */}
      <Link
        href="/dashboard/leads?status=bot_active"
        className="group rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-sm font-semibold text-ink">Agente activo</p>
        <p className="mt-0.5 text-xs text-ink-3">conversaciones automatizadas activas</p>
        <p
          className="mt-4 font-mono text-3xl font-bold tabular-nums"
          style={{ color: "var(--color-bot-active)" }}
        >
          {bot_active.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">leads gestionados por IA</p>
        <p className="mt-3 text-xs font-medium text-signal opacity-0 transition-opacity group-hover:opacity-100">
          Ver conversaciones →
        </p>
      </Link>

      {/* Requieren atención humana */}
      <div
        className={`rounded-2xl border bg-surface-raised p-5 shadow-sm ${
          human_active > 0 ? "border-bot-paused/30" : "border-edge"
        }`}
      >
        <p className="text-sm font-semibold text-ink">Requieren atención</p>
        <p className="mt-0.5 text-xs text-ink-3">leads con intervención humana activa</p>
        <p
          className={`mt-4 font-mono text-3xl font-bold tabular-nums ${
            human_active > 0 ? "text-bot-paused-text" : "text-ink"
          }`}
        >
          {human_active.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">conversaciones pendientes</p>
        {human_active > 0 ? (
          <Link
            href="/dashboard/leads?paused=true"
            className="mt-3 inline-flex items-center rounded-lg bg-bot-paused px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Atender ahora
          </Link>
        ) : (
          <p className="mt-3 text-xs text-ink-4">Sin pendientes</p>
        )}
      </div>

      {/* Resueltos + Perdidos */}
      <Link
        href="/dashboard/leads?status=resolved"
        className="group rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <p className="text-sm font-semibold text-ink">Finalizados</p>
        <p className="mt-0.5 text-xs text-ink-3">resumen del pipeline</p>
        <div className="mt-4 flex items-end gap-5">
          <div>
            <p className="font-mono text-3xl font-bold tabular-nums text-lead-warm">{resolved}</p>
            <p className="mt-1 text-xs text-ink-3">resueltos</p>
          </div>
          <div className="mb-1 h-8 w-px bg-edge" />
          <div>
            <p className="font-mono text-3xl font-bold tabular-nums text-lead-cold">{lost}</p>
            <p className="mt-1 text-xs text-ink-3">perdidos</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-signal opacity-0 transition-opacity group-hover:opacity-100">
          Ver finalizados →
        </p>
      </Link>
    </div>
  );
}
