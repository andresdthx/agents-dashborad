import { AlertTriangle, Eye, Wrench, MessageSquare } from "lucide-react";

type HandoffMode = "urgent" | "requested" | "technical" | "observer";

const handoffConfig: Record<
  HandoffMode,
  { label: string; Icon: typeof AlertTriangle; className: string }
> = {
  urgent: {
    label: "Urgente",
    Icon: AlertTriangle,
    className:
      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  requested: {
    label: "Solicitado",
    Icon: MessageSquare,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  technical: {
    label: "Técnico",
    Icon: Wrench,
    className: "border-edge bg-surface text-ink-3",
  },
  observer: {
    label: "Observador",
    Icon: Eye,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
};

// Claves de código (bot_paused_reason) → texto legible para el agente.
// Actualizadas según los grupos de handoff definidos en handoff-guide.md.
const pausedReasonLabel: Record<string, string> = {
  // URGENT
  order_confirmed: "Pedido confirmado",
  reservation_confirmed: "Reserva confirmada",
  llm_handoff_urgent: "Bot escaló urgente",
  // REQUESTED
  llm_handoff: "Bot solicitó atención",
  needs_images: "Fotos solicitadas",
  vision_low_conf: "Imagen no reconocida",
  no_catalog_match: "Sin coincidencia en catálogo",
  human_takeover: "Tomado por agente",
  domicilio_exception: "Consulta de domicilio",
  // TECHNICAL
  no_catalog: "Sin catálogo configurado",
  out_of_stock: "Sin stock",
  config_error: "Error de configuración",
};

interface Props {
  handoffMode: HandoffMode | null | undefined;
  handoffReason?: string | null;
  botPausedReason?: string | null;
}

export function HandoffBadge({ handoffMode, handoffReason, botPausedReason }: Props) {
  if (!handoffMode) return null;

  const config = handoffConfig[handoffMode];
  const { Icon } = config;
  // handoffReason tiene prioridad (texto libre del LLM).
  // Usamos || para descartar cadenas vacías que el backend pudiera enviar.
  const reasonText: string | null =
    handoffReason?.trim() ||
    (botPausedReason ? (pausedReasonLabel[botPausedReason] ?? null) : null) ||
    null;

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${config.className}`}
      >
        <Icon className="h-3 w-3 shrink-0" />
        {config.label}
      </span>
      {reasonText && (
        <span
          className="max-w-[180px] truncate text-[11px] text-ink-3"
          title={reasonText}
        >
          {reasonText}
        </span>
      )}
    </div>
  );
}
