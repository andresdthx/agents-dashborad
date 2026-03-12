import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/queries/leads";
import { getMessagesByLeadId } from "@/lib/queries/messages";
import { ClassificationBadge } from "@/components/leads/ClassificationBadge";
import { ConversationThread } from "@/components/leads/ConversationThread";
import { BotToggleButton } from "@/components/leads/BotToggleButton";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ClipboardList, CheckCircle2 } from "lucide-react";
import { HandoffBadge } from "@/components/leads/HandoffBadge";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ lead: leadData, error }, { messages }] = await Promise.all([
    getLeadById(id),
    getMessagesByLeadId(id),
  ]);

  if (error || !leadData) notFound();
  const lead = leadData!;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1 text-sm text-ink-3 transition-colors hover:text-ink-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a leads
      </Link>

      {/* Human active banner */}
      {lead.status === "human_active" && (
        <div className="flex items-start gap-3 rounded-lg border border-bot-paused/25 bg-bot-paused-surface px-4 py-3">
          <span className="relative mt-1 flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bot-paused opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-bot-paused" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-bot-paused-text">
              Atención humana activa — el bot está pausado en este lead
            </p>
            {lead.handoff_mode && (
              <HandoffBadge
                handoffMode={lead.handoff_mode}
                handoffReason={lead.handoff_reason}
                botPausedReason={lead.bot_paused_reason}
              />
            )}
          </div>
        </div>
      )}

      {/* Urgent handoff with resolved status (order_confirmed) */}
      {lead.status === "resolved" && lead.handoff_mode === "urgent" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3">
          <HandoffBadge
            handoffMode="urgent"
            handoffReason={lead.handoff_reason}
            botPausedReason={lead.bot_paused_reason}
          />
        </div>
      )}

      {/* Hot lead — confirmed order banner */}
      {lead.classification === "hot" &&
        (lead.score ?? 0) >= 100 &&
        lead.order_confirmed_at !== null && (
          <div className="flex items-center gap-3 rounded-lg border border-lead-hot/25 bg-lead-hot-surface px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-lead-hot-text" />
            <p className="text-sm font-medium text-lead-hot-text">
              Pedido confirmado — este lead está listo para cerrar la venta
            </p>
          </div>
        )}

      {/* Hot lead — pending info banner */}
      {lead.classification === "hot" && (lead.score ?? 0) < 100 && (
        <div className="flex items-center gap-3 rounded-lg border border-lead-hot/25 bg-lead-hot-surface px-4 py-3">
          <ClipboardList className="h-4 w-4 shrink-0 text-lead-hot-text" />
          <p className="text-sm font-medium text-lead-hot-text">
            Lead urgente con información pendiente — recopila los datos que faltan antes de cerrar
            (puntaje actual: {lead.score ?? 0}/100)
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold tabular-nums text-ink">{lead.phone}</h1>
          <p className="mt-1 text-sm text-ink-3">
            Lead desde {formatDateTime(lead.created_at)}
          </p>
        </div>
        <BotToggleButton
          leadId={lead.id}
          botPaused={lead.bot_paused}
        />
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Clasificación */}
        <div className="rounded-lg border border-edge bg-surface-raised p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">
            Clasificación
          </p>
          <div className="mt-2">
            <ClassificationBadge
              classification={lead.classification}
              confirmed={
                lead.classification === "hot"
                  ? (lead.score ?? 0) >= 100 || lead.order_confirmed_at !== null
                  : undefined
              }
            />
          </div>
        </div>

        {/* Score — featured */}
        <div
          className="rounded-lg border border-signal/20 bg-signal-surface p-4"
          title="Puntaje de interés calculado por IA. 0 = sin interés · 100 = listo para comprar"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Puntaje IA</p>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-signal">
            {lead.score ?? "—"}
          </p>
          {lead.score !== null && (
            <>
              <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-edge-strong">
                <div
                  className="h-0.5 rounded-full bg-signal transition-all"
                  style={{ width: `${lead.score}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-4">de 100 — mayor es mejor</p>
            </>
          )}
        </div>

        {/* Status */}
        <div className="rounded-lg border border-edge bg-surface-raised p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Estado</p>
          <div className="mt-2">
            {lead.status === "human_active" ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-bot-paused/25 bg-bot-paused-surface px-2 py-1 text-sm font-medium text-bot-paused-text">
                <span className="h-1.5 w-1.5 rounded-full bg-bot-paused" />
                Atención humana
              </span>
            ) : lead.status === "resolved" ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-surface px-2 py-1 text-sm font-medium text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-4" />
                Resuelto
              </span>
            ) : lead.status === "lost" ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-surface px-2 py-1 text-sm font-medium text-ink-3">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-4" />
                Perdido
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-bot-active/25 bg-bot-active-surface px-2 py-1 text-sm font-medium text-bot-active-text">
                <span className="h-1.5 w-1.5 rounded-full bg-bot-active" />
                Agente activo
              </span>
            )}
          </div>
        </div>

        {/* Mensajes */}
        <div className="rounded-lg border border-edge bg-surface-raised p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Mensajes</p>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-ink">
            {messages.length}
          </p>
        </div>
      </div>

      {/* Extracted data — perfil del lead */}
      {lead.extracted_data && Object.keys(lead.extracted_data).length > 0 && (
        <div className="rounded-lg border border-edge bg-surface-raised p-4">
          <p className="text-sm font-semibold text-ink">Datos del perfil</p>
          <dl className="mt-3 space-y-2">
            {Object.entries(lead.extracted_data as Record<string, unknown>).map(([key, value]) => (
              <div key={key} className="flex flex-wrap gap-x-3 gap-y-0.5">
                <dt className="shrink-0 text-xs font-medium capitalize text-ink-3">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="text-xs text-ink-2">
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value ?? "—")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Reasoning — razonamiento del clasificador IA */}
      {lead.reasoning && (
        <div className="rounded-lg border border-signal/15 bg-signal-surface p-4">
          <p className="text-sm font-semibold text-ink">Razonamiento del clasificador IA</p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
            {lead.reasoning}
          </p>
        </div>
      )}

      {/* Order data */}
      {lead.order_data && (
        <div className="rounded-lg border border-lead-warm/25 bg-lead-warm-surface p-4">
          <p className="text-sm font-semibold text-lead-warm-text">Pedido confirmado</p>
          <dl className="mt-3 space-y-2">
            {Object.entries(lead.order_data as Record<string, unknown>).map(([key, value]) => (
              <div key={key} className="flex flex-wrap gap-x-3 gap-y-0.5">
                <dt className="shrink-0 text-xs font-medium capitalize text-lead-warm-text opacity-70">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="text-xs text-lead-warm-text">
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value ?? "—")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Conversation */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-3">
          Conversación
        </h2>
        <ConversationThread messages={messages} />
      </div>
    </div>
  );
}
