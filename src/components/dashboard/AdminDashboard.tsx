import Link from "next/link";
import type { GlobalStats, ClientSummary } from "@/lib/queries/clients";
import { Users, TrendingUp, PauseCircle, Activity } from "lucide-react";

interface AdminDashboardProps {
  globalStats: GlobalStats;
  clientsSummary: ClientSummary[];
  displayName: string;
}

function StatTile({
  label,
  value,
  sub,
  colorClass,
}: {
  label: string;
  value: number | string;
  sub?: string;
  colorClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">{label}</p>
      <p
        className={`mt-2 font-mono text-4xl font-bold tabular-nums ${colorClass ?? "text-ink"}`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-ink-3">{sub}</p>}
    </div>
  );
}

function DistributionBar({
  hot,
  warm,
  cold,
}: {
  hot: number;
  warm: number;
  cold: number;
}) {
  const total = hot + warm + cold;
  if (total === 0) return null;
  const hotPct = Math.round((hot / total) * 100);
  const warmPct = Math.round((warm / total) * 100);
  const coldPct = 100 - hotPct - warmPct;

  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full">
        <div style={{ width: `${hotPct}%` }} className="bg-lead-hot transition-all" />
        <div style={{ width: `${warmPct}%` }} className="bg-lead-warm transition-all" />
        <div style={{ width: `${coldPct}%` }} className="bg-lead-cold transition-all" />
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1 text-lead-hot-text">
          <span className="h-1.5 w-1.5 rounded-full bg-lead-hot" />
          Hot {hotPct}%
        </span>
        <span className="flex items-center gap-1 text-lead-warm-text">
          <span className="h-1.5 w-1.5 rounded-full bg-lead-warm" />
          Warm {warmPct}%
        </span>
        <span className="flex items-center gap-1 text-lead-cold-text">
          <span className="h-1.5 w-1.5 rounded-full bg-lead-cold" />
          Cold {coldPct}%
        </span>
      </div>
    </div>
  );
}

export function AdminDashboard({
  globalStats,
  clientsSummary,
  displayName,
}: AdminDashboardProps) {
  const {
    totalClients,
    activeClients,
    inactiveClients,
    clientsWithPausedBots,
    totalLeads,
    globalHot,
    globalWarm,
    globalCold,
  } = globalStats;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-violet-50/40 to-sky-50/30 p-6 dark:border-indigo-900/30 dark:from-indigo-950/40 dark:via-violet-950/20 dark:to-sky-950/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-md bg-signal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-signal">
            Super Admin
          </span>
        </div>
        <h1 className="text-xl font-semibold text-ink">¡Gusto verte, {displayName}!</h1>
        <p className="mt-1.5 max-w-sm text-sm text-ink-3">
          Vista global del sistema — métricas consolidadas de todos los clientes y leads.
        </p>
        <Link
          href="/admin/clients"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-signal-fg transition-opacity hover:opacity-90"
        >
          <Users className="h-3.5 w-3.5" />
          Gestionar clientes
        </Link>
      </div>

      {/* Alertas */}
      {clientsWithPausedBots > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-bot-paused/40 bg-bot-paused-surface px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bot-paused opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-bot-paused" />
            </span>
            <p className="text-sm font-medium text-bot-paused-text">
              {clientsWithPausedBots} cliente{clientsWithPausedBots !== 1 ? "s" : ""} con bots
              pausados — requieren intervención
            </p>
          </div>
          <Link
            href="/dashboard/leads?paused=true"
            className="shrink-0 rounded-lg bg-bot-paused px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ver leads
          </Link>
        </div>
      )}

      {/* Métricas globales */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-3">
          Métricas globales
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            label="Clientes activos"
            value={activeClients}
            sub={`${inactiveClients} inactivos · ${totalClients} total`}
            colorClass="text-bot-active-text"
          />
          <StatTile
            label="Clientes totales"
            value={totalLeads}
            sub="en todo el sistema"
          />
          <StatTile
            label="Clientes Hot"
            value={globalHot}
            sub="alto interés"
            colorClass="text-lead-hot-text"
          />
          <StatTile
            label="Bots con pausa"
            value={clientsWithPausedBots}
            sub="clientes afectados"
            colorClass={clientsWithPausedBots > 0 ? "text-bot-paused-text" : "text-ink"}
          />
        </div>
      </div>

      {/* Distribución global Hot/Warm/Cold */}
      {(globalHot + globalWarm + globalCold) > 0 && (
        <div className="rounded-2xl border border-edge bg-surface-raised p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-ink-3" />
            <p className="text-sm font-semibold text-ink">Distribución global de clasificación</p>
          </div>
          <div className="mb-5 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-mono text-3xl font-bold tabular-nums text-lead-hot-text">
                {globalHot}
              </p>
              <p className="mt-1 text-xs text-lead-hot-text opacity-70">Hot</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-bold tabular-nums text-lead-warm-text">
                {globalWarm}
              </p>
              <p className="mt-1 text-xs text-lead-warm-text opacity-70">Warm</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-bold tabular-nums text-lead-cold-text">
                {globalCold}
              </p>
              <p className="mt-1 text-xs text-lead-cold-text opacity-70">Cold</p>
            </div>
          </div>
          <DistributionBar hot={globalHot} warm={globalWarm} cold={globalCold} />
        </div>
      )}

      {/* Top 10 clientes por leads */}
      {clientsSummary.length > 0 && (
        <div className="rounded-2xl border border-edge bg-surface-raised shadow-sm">
          <div className="flex items-center gap-2 border-b border-edge px-5 py-4">
            <TrendingUp className="h-4 w-4 text-ink-3" />
            <p className="text-sm font-semibold text-ink">Ranking de clientes por leads</p>
          </div>
          <ul className="divide-y divide-edge">
            {clientsSummary.map((client, idx) => {
              const clientTotal = client.total_leads;
              const hotPct = clientTotal > 0 ? Math.round((client.hot / clientTotal) * 100) : 0;

              return (
                <li key={client.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-ink-4">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">{client.name}</span>
                      {!client.active && (
                        <span className="shrink-0 rounded-sm border border-edge px-1 py-0 text-[10px] text-ink-4">
                          inactivo
                        </span>
                      )}
                      {client.paused > 0 && (
                        <span className="shrink-0 flex items-center gap-1 rounded-sm bg-bot-paused-surface px-1.5 text-[10px] font-medium text-bot-paused-text">
                          <PauseCircle className="h-2.5 w-2.5" />
                          {client.paused} pausado{client.paused !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-edge">
                      <div
                        style={{ width: `${hotPct}%` }}
                        className="bg-lead-hot transition-all"
                      />
                      <div
                        style={{
                          width: `${clientTotal > 0 ? Math.round((client.warm / clientTotal) * 100) : 0}%`,
                        }}
                        className="bg-lead-warm transition-all"
                      />
                      <div
                        style={{
                          width: `${clientTotal > 0 ? Math.round((client.cold / clientTotal) * 100) : 0}%`,
                        }}
                        className="bg-lead-cold transition-all"
                      />
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-ink">
                    {clientTotal}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
