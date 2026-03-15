import type { Metadata } from "next";
import { getLeadStats, getLeadChartData } from "@/lib/queries/leads";
import { getGlobalStats, getClientsSummary, getGlobalLeadChartData } from "@/lib/queries/clients";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { WeeklySparkline } from "@/components/dashboard/WeeklySparkline";
import { StatusBars } from "@/components/dashboard/StatusBars";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, BarChart3, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | AgentsLeads",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

// Obtener rol, client_id y nombre del negocio en una sola query
  const { data: clientUserData } = await supabase
    .from("client_users")
    .select("role, client_id, clients(name)")
    .eq("user_id", user?.id ?? "")
    .limit(1)
    .single();

  const clientName = (clientUserData?.clients as { name?: string } | null)?.name ?? null;
  const rawName =
    clientName ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0]?.split(".")[0] ??
    "usuario";
  const displayName =
    typeof rawName === "string"
      ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
      : "usuario";

  const isSuperAdmin = clientUserData?.role === "super_admin";

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

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-signal/15 bg-linear-to-br from-signal/8 to-surface-raised p-6">
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

      {/* Alert banner — hot leads with pending info */}
      {stats.hotPending > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-lead-hot/30 bg-lead-hot-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="h-4 w-4 shrink-0 text-lead-hot-text" />
            <p className="text-sm font-medium text-lead-hot-text">
              {stats.hotPending} lead{stats.hotPending !== 1 ? "s" : ""} hot con información
              pendiente — se debe recopilar datos antes de cerrar
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
            href="/dashboard/leads?paused=true"
            className="shrink-0 rounded-lg bg-bot-paused px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Atender ahora
          </Link>
        </div>
      )}

      <StatsCards stats={stats} />

      {/* Charts section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-ink-4" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-4">Análisis</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DonutChart hot={stats.hot} warm={stats.warm} cold={stats.cold} />
          <WeeklySparkline data={chartData.weeklyTrend} />
        </div>
      </div>

      {/* Conversations section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-ink-4" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-4">
            Conversaciones
          </h2>
        </div>
        <StatusBars statusCounts={chartData.statusCounts} />
      </div>
    </div>
  );
}
