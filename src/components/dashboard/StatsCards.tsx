import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";

interface Stats {
  total: number;
  hot: number;
  hotConfirmed: number;
  hotPending: number;
  warm: number;
  cold: number;
  today: number;
  yesterday: number;
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
            opacity={i === bars.length - 1 ? 1 : 0.2 + (i / bars.length) * 0.6}
          />
        );
      })}
    </svg>
  );
}

function ProgressTrack({
  pct,
  colorClass,
}: {
  pct: number;
  colorClass: string;
}) {
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-current/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function TodayDelta({ today, yesterday }: { today: number; yesterday: number }) {
  const delta = today - yesterday;
  if (delta === 0) return <span className="text-ink-4 text-[10px]">= ayer</span>;
  const positive = delta > 0;
  return (
    <span
      className={`text-[10px] font-semibold tabular-nums ${
        positive ? "text-bot-active-text" : "text-lead-cold-text"
      }`}
    >
      {positive ? "+" : ""}
      {delta} vs ayer
    </span>
  );
}

export function StatsCards({ stats }: { stats: Stats }) {
  const classified = stats.hot + stats.warm + stats.cold;
  const hotPct = classified ? Math.round((stats.hot / classified) * 100) : 0;
  const warmPct = classified ? Math.round((stats.warm / classified) * 100) : 0;
  const coldPct = classified ? 100 - hotPct - warmPct : 0;
  const maxVal = Math.max(stats.hot, stats.warm, stats.cold, 1);

  const warmColdCards = [
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
      bar: "bg-lead-warm",
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
      bar: "bg-lead-cold",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Temperature trio — only shown when there are classified leads */}
      {classified > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Hot card — split into confirmed (score=100) vs pending (score<100) */}
          <Link
            href="/dashboard/leads?classification=hot"
            aria-label={`Alto interés: ${stats.hot} leads calificados como hot`}
            className="group rounded-2xl bg-lead-hot-surface p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-lead-hot-text">Alto interés</p>
                <p className="mt-0.5 text-[11px] text-lead-hot-text/60">
                  clasificados como hot
                </p>
              </div>
              <MiniBarChart value={stats.hot} max={maxVal} color="var(--color-lead-hot)" />
            </div>
            <div className="mt-4">
              <p className="font-mono text-4xl font-bold tabular-nums text-lead-hot-text">
                {stats.hot}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-lead-hot-text/60">leads activos</p>
                {classified > 0 && (
                  <span className="font-mono text-xs font-semibold tabular-nums text-lead-hot-text/70">
                    {hotPct}%
                  </span>
                )}
              </div>
              <ProgressTrack pct={hotPct} colorClass="bg-lead-hot" />
              {/* Desglose confirmed vs pending */}
              {stats.hot > 0 && (
                <div className="mt-3 flex items-center gap-2 border-t border-lead-hot/15 pt-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-lead-hot-text/60">
                      Confirmados
                    </p>
                    <p className="font-mono text-lg font-bold tabular-nums text-lead-hot-text">
                      {stats.hotConfirmed}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-lead-hot/20" />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-lead-hot-text/60">
                      Info pendiente
                    </p>
                    <p className="font-mono text-lg font-bold tabular-nums text-lead-hot-text">
                      {stats.hotPending}
                    </p>
                  </div>
                </div>
              )}
              {stats.hotHumanActive > 0 && (
                <p className="mt-1 text-xs text-bot-paused-text">
                  {stats.hotHumanActive} en atención humana
                </p>
              )}
            </div>
          </Link>

          {warmColdCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              aria-label={`${card.title}: ${card.count} leads`}
              className={`group rounded-2xl ${card.bg} p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${card.text}`}>{card.title}</p>
                  <p className={`mt-0.5 text-[11px] ${card.text}/60`}>{card.subtitle}</p>
                </div>
                <MiniBarChart value={card.count} max={maxVal} color={card.color} />
              </div>
              <div className="mt-4">
                <p className={`font-mono text-4xl font-bold tabular-nums ${card.text}`}>
                  {card.count}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className={`text-xs ${card.text}/60`}>leads activos</p>
                  {classified > 0 && (
                    <span className={`font-mono text-xs font-semibold tabular-nums ${card.text}/70`}>
                      {card.pct}%
                    </span>
                  )}
                </div>
                <ProgressTrack pct={card.pct} colorClass={card.bar} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Operational strip — total / today */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total leads */}
        <Link
          href="/dashboard/leads"
          aria-label={`Total leads: ${stats.total}`}
          className="group rounded-2xl bg-surface-raised p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3">
              Total leads
            </p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-signal/10">
              <Users className="h-4 w-4 text-signal" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-ink">{stats.total}</p>
          <p className="mt-1 text-xs text-ink-3">todos los leads registrados</p>
        </Link>

        {/* Hoy */}
        <div className="rounded-2xl bg-surface-raised p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3">
              Nuevos hoy
            </p>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bot-active/10">
              <TrendingUp className="h-4 w-4 text-bot-active-text" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-ink">{stats.today}</p>
          <div className="mt-1">
            <p className="text-xs text-ink-3">leads nuevos este día</p>
            <TodayDelta today={stats.today} yesterday={stats.yesterday} />
          </div>
        </div>
      </div>
    </div>
  );
}
