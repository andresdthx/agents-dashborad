import { cn } from "@/lib/utils";

interface Props {
  classification: "hot" | "warm" | "cold" | null;
}

const styles: Record<string, string> = {
  hot: "border-lead-hot/30 bg-lead-hot-surface text-lead-hot-text",
  warm: "border-lead-warm/30 bg-lead-warm-surface text-lead-warm-text",
  cold: "border-lead-cold/30 bg-lead-cold-surface text-lead-cold-text",
};

const labels: Record<string, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export function ClassificationBadge({ classification }: Props) {
  if (!classification) {
    return (
      <span className="inline-flex items-center rounded-md border border-edge px-2 py-0.5 text-xs font-medium text-ink-4">
        Sin clasificar
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        styles[classification]
      )}
    >
      {labels[classification]}
    </span>
  );
}
