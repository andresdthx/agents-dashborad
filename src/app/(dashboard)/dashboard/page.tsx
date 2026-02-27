import { getLeadStats, getLeadChartData } from "@/lib/queries/leads";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { WeeklySparkline } from "@/components/dashboard/WeeklySparkline";
import { StatusBars } from "@/components/dashboard/StatusBars";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawName = user?.email?.split("@")[0]?.split(".")[0] ?? "usuario";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const [stats, chartData] = await Promise.all([getLeadStats(), getLeadChartData()]);

  return (
    <div className="space-y-5">
      {/* Welcome banner + bot status card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-violet-50/40 to-sky-50/30 p-6 dark:border-indigo-900/30 dark:from-indigo-950/40 dark:via-violet-950/20 dark:to-sky-950/10">
          <h1 className="text-xl font-semibold text-ink">¡Gusto verte, {displayName}!</h1>
          <p className="mt-1.5 max-w-sm text-sm text-ink-3">
            Monitorea la calificación automática de tus leads y gestiona las conversaciones activas
            en tiempo real.
          </p>
          <Link
            href="/dashboard/leads?classification=hot"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-signal-fg transition-opacity hover:opacity-90"
          >
            Ver leads urgentes
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
              Estado del bot
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                stats.paused > 0
                  ? "bg-bot-paused-surface text-bot-paused-text"
                  : "bg-bot-active-surface text-bot-active-text"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  stats.paused > 0 ? "bg-bot-paused" : "bg-bot-active"
                }`}
              />
              {stats.paused > 0
                ? `${stats.paused} pausado${stats.paused !== 1 ? "s" : ""}`
                : "Todos activos"}
            </span>
          </div>
          <div className="mt-5">
            <p className="font-mono text-4xl font-bold tabular-nums text-lead-hot-text">
              {stats.hot}
            </p>
            <p className="mt-0.5 text-xs text-ink-3">leads urgentes esperando</p>
          </div>
          <Link
            href="/dashboard/leads?classification=hot"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-signal hover:underline"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Revisar leads hot →
          </Link>
        </div>
      </div>

      {/* Alert banner — bot paused */}
      {stats.paused > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-bot-paused/40 bg-bot-paused-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bot-paused opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bot-paused" />
            </span>
            <p className="text-sm font-medium text-bot-paused-text">
              {stats.paused} bot{stats.paused !== 1 ? "s" : ""} pausado
              {stats.paused !== 1 ? "s" : ""} — requiere
              {stats.paused !== 1 ? "n" : ""} intervención humana
            </p>
          </div>
          <Link
            href="/dashboard/leads?paused=true"
            className="shrink-0 rounded-lg bg-bot-paused px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Atender ahora
          </Link>
        </div>
      )}

      <StatsCards stats={stats} />

      {/* Charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DonutChart hot={stats.hot} warm={stats.warm} cold={stats.cold} />
        <WeeklySparkline data={chartData.weeklyTrend} />
      </div>

      <StatusBars statusCounts={chartData.statusCounts} />
    </div>
  );
}
