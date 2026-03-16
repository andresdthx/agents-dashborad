"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklySparklineProps {
  data: { date: string; count: number }[];
  title?: string;
  emptyLabel?: string;
}

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

interface TooltipPayload {
  value: number;
  payload: { date: string; count: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const { date, count } = payload[0].payload;
  const [y, m, d] = date.split("-").map(Number);
  const dayName = DAY_NAMES[new Date(y, m - 1, d).getDay()];

  return (
    <div className="rounded-lg border border-edge bg-surface-overlay px-3 py-2 shadow-md">
      <p className="text-[11px] font-medium text-ink-2">
        {dayName} {d}/{m}
      </p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-ink">
        {count} lead{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function WeeklySparkline({
  data,
  title = "Clientes últimos 7 días",
  emptyLabel = "Sin leads esta semana",
}: WeeklySparklineProps) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const n = data.length;

  const chartData = data.map((d, i) => {
    const [y, m, day] = d.date.split("-").map(Number);
    return {
      ...d,
      label: DAY_NAMES[new Date(y, m - 1, day).getDay()],
      isToday: i === n - 1,
    };
  });

  return (
    <div className="rounded-xl bg-surface-raised p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-[11px] text-ink-3">
            {total > 0 ? `${total} leads en 7 días` : "Sin actividad esta semana"}
          </p>
        </div>
        {/* Active badge */}
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-signal/20 bg-signal/10 px-2.5 py-1 text-[10px] font-semibold text-signal">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          Activos
        </span>
      </div>

      {/* Chart or empty state */}
      {total === 0 ? (
        <div className="mt-4 flex h-[180px] items-center justify-center rounded-lg bg-canvas">
          <p className="text-xs text-ink-4">{emptyLabel}</p>
        </div>
      ) : (
        <div className="mt-4 h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, left: -32, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-signal)"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-signal)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-edge-subtle)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "var(--color-ink-4)" }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 9, fill: "var(--color-ink-4)" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--color-signal)",
                  strokeWidth: 1,
                  strokeDasharray: "4 2",
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-signal)"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={(props) => {
                  const { cx, cy, index } = props;
                  const isToday = index === n - 1;
                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r={isToday ? 4 : 3}
                      fill="var(--color-signal)"
                      stroke="var(--color-surface-raised)"
                      strokeWidth={1.5}
                      opacity={isToday ? 1 : 0.75}
                    />
                  );
                }}
                activeDot={{
                  r: 4,
                  fill: "var(--color-signal)",
                  stroke: "var(--color-surface-raised)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
