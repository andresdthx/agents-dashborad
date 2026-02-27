import Link from "next/link";

interface DonutChartProps {
  hot: number;
  warm: number;
  cold: number;
}

const R = 36;
const C = 2 * Math.PI * R; // ≈ 226.19
const GAP = 4; // gap between segments (circumference units)

const LEGEND = [
  {
    key: "hot" as const,
    label: "Hot",
    href: "/dashboard/leads?classification=hot",
    color: "var(--color-lead-hot)",
    text: "var(--color-lead-hot-text)",
  },
  {
    key: "warm" as const,
    label: "Warm",
    href: "/dashboard/leads?classification=warm",
    color: "var(--color-lead-warm)",
    text: "var(--color-lead-warm-text)",
  },
  {
    key: "cold" as const,
    label: "Cold",
    href: "/dashboard/leads?classification=cold",
    color: "var(--color-lead-cold)",
    text: "var(--color-lead-cold-text)",
  },
];

export function DonutChart({ hot, warm, cold }: DonutChartProps) {
  const total = hot + warm + cold;

  if (total === 0) {
    return (
      <div
        role="img"
        aria-label="Sin leads clasificados aún"
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-edge bg-surface-raised p-6 text-center shadow-sm"
      >
        <svg viewBox="0 0 100 100" width="72" height="72" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--color-edge)"
            strokeWidth="10"
          />
        </svg>
        <p className="text-xs text-ink-3">Sin leads clasificados</p>
      </div>
    );
  }

  const counts = { hot, warm, cold };
  const fracs = { hot: hot / total, warm: warm / total, cold: cold / total };
  const lens = {
    hot: Math.max(0, fracs.hot * C - GAP),
    warm: Math.max(0, fracs.warm * C - GAP),
    cold: Math.max(0, fracs.cold * C - GAP),
  };

  // strokeDashoffset positions each segment along the path (negative = push forward)
  const offsets = {
    hot: 0,
    warm: fracs.hot * C,
    cold: (fracs.hot + fracs.warm) * C,
  };

  return (
    <div className="flex flex-col rounded-xl border border-edge bg-surface-raised p-4 shadow-sm">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
        Distribución
      </h2>

      <div className="mt-3 flex flex-1 items-center gap-4">
        {/* SVG donut ring */}
        <svg
          role="img"
          aria-label={`Distribución de ${total} leads: ${hot} urgentes, ${warm} en seguimiento, ${cold} fríos`}
          viewBox="0 0 100 100"
          className="h-auto w-full max-w-[108px] shrink-0"
        >
          <title>Distribución de leads por temperatura</title>

          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--color-edge)"
            strokeWidth="10"
          />

          {/* Segments — group rotated so position 0 is at the top */}
          <g style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}>
            {LEGEND.filter(({ key }) => lens[key] > 0).map(({ key, color, label }) => (
              <circle
                key={key}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={`${lens[key]} ${C}`}
                strokeDashoffset={-offsets[key]}
                strokeLinecap="round"
                aria-label={`${label}: ${counts[key]}`}
              />
            ))}
          </g>

          {/* Center label */}
          <text
            x="50"
            y="46"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fontFamily="monospace"
            fill="var(--color-ink)"
          >
            {total}
          </text>
          <text
            x="50"
            y="59"
            textAnchor="middle"
            fontSize="8"
            fill="var(--color-ink-3)"
          >
            leads
          </text>
        </svg>

        {/* Legend */}
        <ul
          className="flex min-w-0 flex-1 flex-col gap-1"
          role="list"
          aria-label="Leyenda de distribución"
        >
          {LEGEND.map(({ key, label, href, color }) => {
            const count = counts[key];
            const pct = Math.round(fracs[key] * 100);
            return (
              <li key={key}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 text-xs text-ink-2">{label}</span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-ink">
                    {count}
                  </span>
                  <span className="w-8 text-right font-mono text-[10px] tabular-nums text-ink-4">
                    {pct}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
