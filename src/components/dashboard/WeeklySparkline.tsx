interface WeeklySparklineProps {
  data: { date: string; count: number }[];
}

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

// ViewBox dimensions (logical units)
const VW = 280;
const VH = 80;
const PAD = { top: 16, bottom: 22, left: 8, right: 8 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

export function WeeklySparkline({ data }: WeeklySparklineProps) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const n = data.length;

  const pts = data.map((d, i) => {
    const x = n < 2 ? PAD.left + PLOT_W / 2 : PAD.left + (i / (n - 1)) * PLOT_W;
    const y = PAD.top + PLOT_H - (d.count / maxVal) * PLOT_H;
    return { x, y, count: d.count, date: d.date };
  });

  const baseline = PAD.top + PLOT_H;
  const polyLine = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaD = [
    `M ${pts[0].x} ${baseline}`,
    ...pts.map((p) => `L ${p.x} ${p.y}`),
    `L ${pts[pts.length - 1].x} ${baseline}`,
    "Z",
  ].join(" ");

  return (
    <div className="rounded-xl border border-edge bg-surface-raised p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
          Últimos 7 días
        </h2>
        <span className="font-mono text-xs font-semibold tabular-nums text-ink">
          {total} total
        </span>
      </div>

      {total === 0 ? (
        <div className="mt-3 flex h-[58px] items-center justify-center rounded-lg bg-canvas">
          <p className="text-xs text-ink-4">Sin leads esta semana</p>
        </div>
      ) : (
        /* Container uses CSS aspect-ratio so the SVG scales without distortion */
        <div className="mt-3 w-full" style={{ aspectRatio: `${VW} / ${VH}` }}>
          <svg
            role="img"
            aria-label={`Tendencia semanal: ${total} leads en los últimos 7 días`}
            viewBox={`0 0 ${VW} ${VH}`}
            width="100%"
            height="100%"
          >
            <title>Tendencia de leads en los últimos 7 días</title>

            {/* Grid lines — subtle horizontal rules at 25%, 50%, 75% */}
            {[0.25, 0.5, 0.75].map((f) => {
              const gy = PAD.top + PLOT_H * (1 - f);
              return (
                <line
                  key={f}
                  x1={PAD.left}
                  y1={gy}
                  x2={PAD.left + PLOT_W}
                  y2={gy}
                  stroke="var(--color-edge-subtle)"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Area fill */}
            <path d={areaD} fill="var(--color-signal)" fillOpacity="0.07" />

            {/* Line */}
            <polyline
              points={polyLine}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots + labels per day */}
            {pts.map((p, i) => {
              const [y, m, d] = p.date.split("-").map(Number);
              const dayName = DAY_NAMES[new Date(y, m - 1, d).getDay()];
              const isToday = i === n - 1;

              return (
                <g key={i}>
                  {/* Count above dot (only when > 0) */}
                  {p.count > 0 && (
                    <text
                      x={p.x}
                      y={p.y - 5}
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="600"
                      fill="var(--color-ink-2)"
                    >
                      {p.count}
                    </text>
                  )}

                  {/* Dot — today is highlighted */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isToday ? 3 : 2}
                    fill={isToday ? "var(--color-signal)" : "var(--color-signal)"}
                    stroke="var(--color-surface-raised)"
                    strokeWidth="1.5"
                    opacity={isToday ? 1 : 0.7}
                  />

                  {/* Day label */}
                  <text
                    x={p.x}
                    y={VH - 6}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight={isToday ? "600" : "400"}
                    fill={isToday ? "var(--color-ink-2)" : "var(--color-ink-4)"}
                  >
                    {dayName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
