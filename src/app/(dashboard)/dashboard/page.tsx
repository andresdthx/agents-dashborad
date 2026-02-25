import { getLeadStats } from "@/lib/queries/leads";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default async function DashboardPage() {
  const stats = await getLeadStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Resumen</h1>
          <p className="mt-0.5 text-sm text-ink-3">Calificación de leads en tiempo real</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-edge bg-surface-raised px-3 py-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              stats.paused > 0 ? "bg-bot-paused" : "bg-bot-active"
            }`}
          />
          <span className="text-[11px] font-medium text-ink-3">
            {stats.paused > 0
              ? `${stats.paused} pausado${stats.paused > 1 ? "s" : ""}`
              : "Bot activo"}
          </span>
        </div>
      </div>

      <StatsCards stats={stats} />
    </div>
  );
}
