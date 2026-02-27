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

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Bot activo */}
      <div className="rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm">
        <p className="text-sm font-semibold text-ink">Bot activo</p>
        <p className="mt-0.5 text-xs text-ink-3">conversaciones automatizadas activas</p>
        <p
          className="mt-4 font-mono text-3xl font-bold tabular-nums"
          style={{ color: "var(--color-bot-active)" }}
        >
          {bot_active.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-ink-3">leads gestionados por IA</p>
      </div>

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
      </div>

      {/* Resueltos + Perdidos */}
      <div className="rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm">
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
      </div>
    </div>
  );
}
