import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  classification: "hot" | "warm" | "cold" | null;
  /**
   * Cuando es true, el lead hot tiene score = 100 (pedido confirmado).
   * Cuando es false, el lead hot tiene score < 100 (información pendiente).
   * Solo aplica cuando classification === "hot".
   */
  confirmed?: boolean;
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

export function ClassificationBadge({ classification, confirmed }: Props) {
  if (!classification) {
    return (
      <span className="inline-flex items-center rounded-md border border-edge px-2 py-0.5 text-xs font-medium text-ink-4">
        Sin clasificar
      </span>
    );
  }

  if (classification === "hot") {
    if (confirmed === true) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
            styles.hot
          )}
          title="Pedido confirmado — listo para cerrar"
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          Hot · Confirmado
        </span>
      );
    }

    if (confirmed === false) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
            styles.hot
          )}
          title="Lead urgente con información pendiente de recopilar"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          Hot · Pendiente
        </span>
      );
    }
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
