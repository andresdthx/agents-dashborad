import type { Metadata } from "next";
import { getLeadStats, getLeadChartData } from "@/lib/queries/leads";
import { getGlobalStats, getClientsSummary, getGlobalLeadChartData } from "@/lib/queries/clients";
import { getSessionClientUser } from "@/lib/queries/session";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { WeeklySparkline } from "@/components/dashboard/WeeklySparkline";
import { StatusBars } from "@/components/dashboard/StatusBars";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, Sparkles, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | AgentsLeads",
};

export default async function DashboardPage() {
  // getSessionClientUser is memoized with React.cache — shares the result with
  // the layout's call, so no extra DB round-trip happens here.
  const session = await getSessionClientUser();

  const clientName = (session?.clients as { name?: string } | null)?.name ?? null;
  const rawName =
    clientName ??
    session?.user?.user_metadata?.full_name ??
    session?.user?.email?.split("@")[0]?.split(".")[0] ??
    "usuario";
  const displayName =
    typeof rawName === "string"
      ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
      : "usuario";

  const isSuperAdmin = session?.role === "super_admin";

  // Si es super_admin, cargar métricas globales
  if (isSuperAdmin) {
    const [globalStats, clientsSummary, globalChartData] = await Promise.all([
      getGlobalStats(),
      getClientsSummary(),
      getGlobalLeadChartData(),
    ]);

    return (
      <AdminDashboard
        globalStats={globalStats}
        clientsSummary={clientsSummary}
        displayName={displayName}
        weeklyTrend={globalChartData.weeklyTrend}
      />
    );
  }

  const [stats, chartData] = await Promise.all([getLeadStats(), getLeadChartData()]);

  const classified = stats.hot + stats.warm + stats.cold;

  return (
    <div className="space-y-6">
      {/* Welcome banner — brand gradient card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-10"
        style={{
          background:
            "linear-gradient(135deg, var(--banner-1) 0%, var(--banner-2) 60%, var(--banner-3) 100%)",
        }}
      >
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Decorative blurred circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-8 right-16 h-36 w-36 rounded-full bg-white/[0.04]" />
          <div className="absolute -bottom-4 left-8 h-20 w-20 rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-white/70" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                Bienvenido
              </span>
            </div>
            <h1 className="text-xl font-semibold text-white">¡Gusto verte, {displayName}!</h1>
            <p className="mt-1.5 max-w-sm text-sm text-white/65">
              Monitorea la calificación automática de tus leads y gestiona las conversaciones activas
              en tiempo real.
            </p>
          </div>
          <Link
            href="/dashboard/leads?classification=hot"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-white/90 hover:shadow-md"
            style={{ color: "var(--banner-2)" }}
          >
            Ver leads urgentes
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Classification notice — shown when no leads classified yet */}
      {classified === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-bot-paused/25 bg-bot-paused-surface px-4 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bot-paused/15">
            <AlertTriangle className="h-4 w-4 text-bot-paused-text" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-bot-paused-text">
              Sin leads clasificados aún
            </p>
            <p className="text-xs text-bot-paused-text opacity-75">
              Los leads se clasifican automáticamente en Hot, Warm y Cold cuando el proceso de IA termine.
            </p>
          </div>
        </div>
      )}

      {/* Alert banner — hot leads with pending info */}
      {stats.hotPending > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-lead-hot/30 bg-lead-hot-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="h-4 w-4 shrink-0 text-lead-hot-text" />
            <p className="text-sm font-medium text-lead-hot-text">
              {stats.hotPending} cliente{stats.hotPending !== 1 ? "s" : ""} potencial{stats.hotPending !== 1 ? "es" : ""} de compra — listos para cerrar
            </p>
          </div>
          <Link
            href="/dashboard/leads?classification=hot"
            className="shrink-0 rounded-lg bg-lead-hot px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Revisar ahora
          </Link>
        </div>
      )}

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
            href="/dashboard/leads?status=human_active"
            className="shrink-0 rounded-lg bg-bot-paused px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Atender ahora
          </Link>
        </div>
      )}

      <StatsCards stats={stats} />

      {/* Charts section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-1 rounded-full bg-signal" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-3">Análisis</h2>
          </div>
          <span className="text-[10px] text-ink-4">Distribución de clasificaciones</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DonutChart hot={stats.hot} warm={stats.warm} cold={stats.cold} />
          <WeeklySparkline data={chartData.weeklyTrend} />
        </div>
      </div>

      {/* Conversations section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-1 rounded-full bg-signal" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-3">
              Conversaciones
            </h2>
          </div>
          <span className="text-[10px] text-ink-4">Estado actual</span>
        </div>
        <StatusBars statusCounts={chartData.statusCounts} />
      </div>
    </div>
  );
}
