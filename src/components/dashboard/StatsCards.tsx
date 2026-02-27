import Link from "next/link";

interface Stats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  today: number;
  paused: number;
  hotHumanActive: number;
}

function MiniBarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const ratios = [0.4, 0.65, 0.5, 0.8, 1];
  const bars = ratios.map((r) => Math.max(3, Math.round(r * Math.max(value, 1))));
  const barMax = Math.max(...bars, 1);

  return (
    <svg width="44" height="28" viewBox="0 0 44 28" aria-hidden="true" className="shrink-0">
      {bars.map((h, i) => {
        const barH = Math.max(3, (h / barMax) * 22);
        return (
          <rect
            key={i}
            x={i * 9}
            y={28 - barH}
            width="6"
            height={barH}
            rx="2"
            fill={color}
            opacity={i === bars.length - 1 ? 1 : 0.25 + (i / bars.length) * 0.6}
          />
        );
      })}
    </svg>
  );
}

export function StatsCards({ stats }: { stats: Stats }) {
  const classified = stats.hot + stats.warm + stats.cold;
  const hotPct = classified ? Math.round((stats.hot / classified) * 100) : 0;
  const warmPct = classified ? Math.round((stats.warm / classified) * 100) : 0;
  const coldPct = classified ? 100 - hotPct - warmPct : 0;
  const maxVal = Math.max(stats.hot, stats.warm, stats.cold, 1);

  const cards = [
    {
      href: "/dashboard/leads?classification=hot",
      title: "Leads urgentes",
      subtitle: "clasificados como hot",
      count: stats.hot,
      pct: hotPct,
      color: "var(--color-lead-hot)",
      border: "border-lead-hot/20",
      bg: "bg-lead-hot-surface",
      text: "text-lead-hot-text",
      extra: stats.hotHumanActive > 0 ? `${stats.hotHumanActive} en atención humana` : null,
    },
    {
      href: "/dashboard/leads?classification=warm",
      title: "En seguimiento",
      subtitle: "clasificados como warm",
      count: stats.warm,
      pct: warmPct,
      color: "var(--color-lead-warm)",
      border: "border-lead-warm/20",
      bg: "bg-lead-warm-surface",
      text: "text-lead-warm-text",
      extra: null,
    },
    {
      href: "/dashboard/leads?classification=cold",
      title: "Bajo interés",
      subtitle: "clasificados como cold",
      count: stats.cold,
      pct: coldPct,
      color: "var(--color-lead-cold)",
      border: "border-lead-cold/20",
      bg: "bg-lead-cold-surface",
      text: "text-lead-cold-text",
      extra: null,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Temperature trio */}
      <div className="grid grid-cols-3 gap-4">
        {classified === 0 ? (
          <div className="col-span-3 rounded-2xl border border-edge bg-canvas p-6 text-center">
            <p className="text-sm font-medium text-ink-3">Sin leads clasificados aún</p>
            <p className="mt-1 text-xs text-ink-4">
              Los leads se clasificarán automáticamente en hot, warm y cold cuando el bot procese las conversaciones.
            </p>
          </div>
        ) : cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group rounded-2xl border ${card.border} ${card.bg} p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${card.text}`}>{card.title}</p>
                <p className={`mt-0.5 text-[11px] ${card.text} opacity-60`}>{card.subtitle}</p>
              </div>
              <MiniBarChart value={card.count} max={maxVal} color={card.color} />
            </div>
            <div className="mt-4">
              <p className={`font-mono text-4xl font-bold tabular-nums ${card.text}`}>
                {card.count}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className={`text-xs ${card.text} opacity-60`}>leads activos</p>
                {classified > 0 && (
                  <span className={`font-mono text-xs font-semibold tabular-nums ${card.text} opacity-70`}>
                    {card.pct}%
                  </span>
                )}
              </div>
              {card.extra && (
                <p className="mt-1 text-xs text-bot-paused-text">{card.extra}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Distribution bar */}
      {classified > 0 && (
        <div className="flex h-1.5 overflow-hidden rounded-full">
          <div style={{ width: `${hotPct}%` }} className="bg-lead-hot transition-all" />
          <div style={{ width: `${warmPct}%` }} className="bg-lead-warm transition-all" />
          <div style={{ width: `${coldPct}%` }} className="bg-lead-cold transition-all" />
        </div>
      )}

      {/* Operational strip — total / today / paused */}
      <div className="flex divide-x divide-edge overflow-hidden rounded-2xl border border-edge bg-surface-raised shadow-sm">
        <Link
          href="/dashboard/leads"
          className="flex flex-1 items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-overlay"
        >
          <div>
            <p className="text-[11px] text-ink-3">Total leads</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-ink">{stats.total}</p>
          </div>
        </Link>

        <div className="flex flex-1 items-center gap-3 px-5 py-4">
          <div>
            <p className="text-[11px] text-ink-3">Hoy</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-ink">{stats.today}</p>
          </div>
        </div>

        <Link
          href="/dashboard/leads?paused=true"
          className={`flex flex-1 items-center gap-3 px-5 py-4 transition-colors ${
            stats.paused > 0
              ? "bg-bot-paused-surface hover:bg-bot-paused/15"
              : "hover:bg-surface-overlay"
          }`}
        >
          <div>
            <p className="text-[11px] text-ink-3">Agente pausado</p>
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${
                stats.paused > 0 ? "text-bot-paused-text" : "text-ink"
              }`}
            >
              {stats.paused}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
