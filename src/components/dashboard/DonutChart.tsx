import Link from "next/link";

interface DonutChartProps {
  hot: number;
  warm: number;
  cold: number;
}

const R = 38;
const C = 2 * Math.PI * R; // ≈ 238.76
const GAP = 4;

const LEGEND = [
  {
    key: "hot" as const,
    label: "Alto interés",
    href: "/dashboard/leads?classification=hot",
    color: "var(--color-lead-hot)",
  },
  {
    key: "warm" as const,
    label: "En seguimiento",
    href: "/dashboard/leads?classification=warm",
    color: "var(--color-lead-warm)",
  },
  {
    key: "cold" as const,
    label: "Bajo interés",
    href: "/dashboard/leads?classification=cold",
    color: "var(--color-lead-cold)",
  },
];

export function DonutChart({ hot, warm, cold }: DonutChartProps) {
  const total = hot + warm + cold;
  const counts = { hot, warm, cold };

  // Empty state — ring with no segments
  if (total === 0) {
    return (
      <div
        role="img"
        aria-label="Sin leads clasificados aún"
        className="flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-raised p-6 shadow-sm"
      >
        {/* Empty donut */}
        <svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--color-edge)"
            strokeWidth="11"
          />
          <text
            x="50"
            y="46"
            textAnchor="middle"
            fontSize="20"
            fontWeight="700"
            fontFamily="monospace"
            fill="var(--color-ink)"
          >
            {total}
          </text>
          <text
            x="50"
            y="60"
            textAnchor="middle"
            fontSize="8"
            fill="var(--color-ink-3)"
          >
            total
          </text>
        </svg>

        <p className="text-xs text-ink-3">Sin leads clasificados</p>

        {/* Legend dots row */}
        <div className="flex items-center gap-4">
          {LEGEND.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span className="text-[11px] text-ink-3">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const fracs = { hot: hot / total, warm: warm / total, cold: cold / total };
  const lens = {
    hot: Math.max(0, fracs.hot * C - GAP),
    warm: Math.max(0, fracs.warm * C - GAP),
    cold: Math.max(0, fracs.cold * C - GAP),
  };
  const offsets = {
    hot: 0,
    warm: fracs.hot * C,
    cold: (fracs.hot + fracs.warm) * C,
  };

  return (
    <div className="flex flex-col items-center rounded-xl bg-surface-raised p-6 shadow-sm">
      {/* Donut chart */}
      <svg
        role="img"
        aria-label={`Distribución de ${total} leads: ${hot} urgentes, ${warm} en seguimiento, ${cold} fríos`}
        viewBox="0 0 100 100"
        className="h-auto w-full max-w-[144px]"
      >
        <title>Distribución de leads por temperatura</title>

        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="var(--color-edge)"
          strokeWidth="11"
        />

        {/* Segments rotated so 0° is at the top */}
        <g style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}>
          {LEGEND.filter(({ key }) => lens[key] > 0).map(({ key, color, label }) => (
            <circle
              key={key}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="11"
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
          fontWeight="700"
          fontFamily="monospace"
          fill="var(--color-ink)"
        >
          {total}
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="8"
          fill="var(--color-ink-3)"
        >
          total
        </text>
      </svg>

      {/* Legend with counts and percentages */}
      <div className="mt-4 w-full space-y-1.5">
        {LEGEND.map(({ key, label, href, color }) => {
          const count = counts[key];
          const pct = Math.round((count / total) * 100);
          return (
            <Link
              key={key}
              href={href}
              className="flex items-center gap-2 transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span className="flex-1 text-[11px] text-ink-3">{label}</span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-ink-2">
                {count}
              </span>
              <span className="w-8 text-right font-mono text-[10px] text-ink-4">{pct}%</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
