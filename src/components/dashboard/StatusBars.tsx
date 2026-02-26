interface StatusBarsProps {
  statusCounts: {
    bot_active: number;
    human_active: number;
    resolved: number;
    lost: number;
  };
}

const STATUS = [
  {
    key: "bot_active" as const,
    label: "Bot activo",
    color: "var(--color-bot-active)",
    track: "var(--color-bot-active-surface)",
  },
  {
    key: "human_active" as const,
    label: "Humano activo",
    color: "var(--color-bot-paused)",
    track: "var(--color-bot-paused-surface)",
  },
  {
    key: "resolved" as const,
    label: "Resueltos",
    color: "var(--color-lead-warm)",
    track: "var(--color-lead-warm-surface)",
  },
  {
    key: "lost" as const,
    label: "Perdidos",
    color: "var(--color-lead-cold)",
    track: "var(--color-lead-cold-surface)",
  },
] as const;

export function StatusBars({ statusCounts }: StatusBarsProps) {
  const total = Object.values(statusCounts).reduce((s, v) => s + v, 0);

  return (
    <div className="rounded-xl border border-edge bg-surface-raised p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
          Estado del pipeline
        </h2>
        <span className="font-mono text-xs tabular-nums text-ink-3">{total} total</span>
      </div>

      {total === 0 ? (
        <p className="mt-3 text-xs text-ink-4">Sin leads registrados</p>
      ) : (
        <ul className="mt-3 space-y-2.5" role="list">
          {STATUS.map(({ key, label, color, track }) => {
            const count = statusCounts[key];
            const pct = total > 0 ? (count / total) * 100 : 0;
            const pctRounded = Math.round(pct);

            return (
              <li key={key} className="flex items-center gap-3">
                {/* Label */}
                <span className="w-[7.5rem] shrink-0 text-xs text-ink-3">{label}</span>

                {/* Bar track + fill */}
                <div
                  className="min-w-0 flex-1 overflow-hidden rounded-full"
                  style={{ background: track, height: "6px" }}
                  role="meter"
                  aria-label={`${label}: ${count} de ${total} leads`}
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={total}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      minWidth: count > 0 ? "4px" : "0px",
                      background: color,
                    }}
                  />
                </div>

                {/* Count */}
                <span className="w-8 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-ink">
                  {count}
                </span>

                {/* Percentage */}
                <span className="w-7 shrink-0 text-right font-mono text-[10px] tabular-nums text-ink-4">
                  {pctRounded}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
