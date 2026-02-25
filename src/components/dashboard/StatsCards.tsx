import { Flame, ThermometerSun, Snowflake, Users, CalendarDays, PauseCircle } from "lucide-react";
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

export function StatsCards({ stats }: { stats: Stats }) {
  const classified = stats.hot + stats.warm + stats.cold;
  const hotPct = classified ? Math.round((stats.hot / classified) * 100) : 0;
  const warmPct = classified ? Math.round((stats.warm / classified) * 100) : 0;
  const coldPct = classified ? 100 - hotPct - warmPct : 0;

  return (
    <div className="space-y-3">
      {/* Temperature trio */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/dashboard/leads?classification=hot"
          className="rounded-xl border border-lead-hot/20 bg-lead-hot-surface p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-lead-hot/35 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lead-hot-text opacity-50">
              Hot
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-lead-hot/10">
              <Flame className="h-3.5 w-3.5 text-lead-hot" />
            </div>
          </div>
          <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-lead-hot-text">
            {stats.hot}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xs text-lead-hot-text opacity-50">leads críticos</p>
            {classified > 0 && (
              <span className="font-mono text-[11px] font-semibold tabular-nums text-lead-hot opacity-70">
                {hotPct}%
              </span>
            )}
          </div>
          {stats.hotHumanActive > 0 && (
            <p className="mt-1 text-xs text-bot-paused-text">
              {stats.hotHumanActive} en atención humana
            </p>
          )}
        </Link>

        <Link
          href="/dashboard/leads?classification=warm"
          className="rounded-xl border border-lead-warm/20 bg-lead-warm-surface p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-lead-warm/35 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lead-warm-text opacity-50">
              Warm
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-lead-warm/10">
              <ThermometerSun className="h-3.5 w-3.5 text-lead-warm" />
            </div>
          </div>
          <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-lead-warm-text">
            {stats.warm}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xs text-lead-warm-text opacity-50">en seguimiento</p>
            {classified > 0 && (
              <span className="font-mono text-[11px] font-semibold tabular-nums text-lead-warm opacity-70">
                {warmPct}%
              </span>
            )}
          </div>
        </Link>

        <Link
          href="/dashboard/leads?classification=cold"
          className="rounded-xl border border-lead-cold/20 bg-lead-cold-surface p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-lead-cold/35 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lead-cold-text opacity-50">
              Cold
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-lead-cold/10">
              <Snowflake className="h-3.5 w-3.5 text-lead-cold" />
            </div>
          </div>
          <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-lead-cold-text">
            {stats.cold}
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xs text-lead-cold-text opacity-50">bajo interés</p>
            {classified > 0 && (
              <span className="font-mono text-[11px] font-semibold tabular-nums text-lead-cold opacity-70">
                {coldPct}%
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Distribution bar */}
      {classified > 0 && (
        <div className="flex h-1 overflow-hidden rounded-full">
          <div style={{ width: `${hotPct}%` }} className="bg-lead-hot" />
          <div style={{ width: `${warmPct}%` }} className="bg-lead-warm" />
          <div style={{ width: `${coldPct}%` }} className="bg-lead-cold" />
        </div>
      )}

      {/* Operational strip */}
      <div className="flex divide-x divide-edge overflow-hidden rounded-xl border border-edge bg-surface-raised shadow-sm">
        <Link
          href="/dashboard/leads"
          className="flex flex-1 items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-overlay"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-canvas">
            <Users className="h-3.5 w-3.5 shrink-0 text-ink-3" />
          </div>
          <div>
            <p className="text-[11px] text-ink-3">Total leads</p>
            <p className="font-mono text-xl font-bold tabular-nums text-ink">{stats.total}</p>
          </div>
        </Link>

        <div className="flex flex-1 items-center gap-3 px-5 py-3.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-canvas">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-ink-3" />
          </div>
          <div>
            <p className="text-[11px] text-ink-3">Hoy</p>
            <p className="font-mono text-xl font-bold tabular-nums text-ink">{stats.today}</p>
          </div>
        </div>

        <Link
          href="/dashboard/leads?paused=true"
          className={`flex flex-1 items-center gap-3 px-5 py-3.5 transition-colors ${
            stats.paused > 0
              ? "bg-bot-paused-surface hover:bg-bot-paused/15"
              : "hover:bg-surface-overlay"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md ${
              stats.paused > 0 ? "bg-bot-paused/15" : "bg-canvas"
            }`}
          >
            <PauseCircle
              className={`h-3.5 w-3.5 shrink-0 ${stats.paused > 0 ? "text-bot-paused" : "text-ink-3"}`}
            />
          </div>
          <div>
            <p className="text-[11px] text-ink-3">Bot pausado</p>
            <p
              className={`font-mono text-xl font-bold tabular-nums ${
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
