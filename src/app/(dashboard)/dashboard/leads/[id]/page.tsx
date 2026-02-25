import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/queries/leads";
import { getMessagesByLeadId } from "@/lib/queries/messages";
import { ClassificationBadge } from "@/components/leads/ClassificationBadge";
import { ConversationThread } from "@/components/leads/ConversationThread";
import { BotToggleButton } from "@/components/leads/BotToggleButton";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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

      {/* Bot paused banner */}
      {lead.bot_paused && (
        <div className="flex items-center gap-3 rounded-lg border border-bot-paused/25 bg-bot-paused-surface px-4 py-3">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bot-paused opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-bot-paused" />
          </span>
          <p className="text-sm font-medium text-bot-paused-text">
            Bot pausado — este lead requiere atención manual
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
          botPausedReason={lead.bot_paused_reason}
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
            <ClassificationBadge classification={lead.classification} />
          </div>
        </div>

        {/* Score — featured */}
        <div className="rounded-lg border border-signal/20 bg-signal-surface p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Score IA</p>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-signal">
            {lead.score ?? "—"}
          </p>
          {lead.score !== null && (
            <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-edge-strong">
              <div
                className="h-0.5 rounded-full bg-signal transition-all"
                style={{ width: `${lead.score}%` }}
              />
            </div>
          )}
        </div>

        {/* Bot state */}
        <div className="rounded-lg border border-edge bg-surface-raised p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Estado bot</p>
          <div className="mt-2">
            {lead.bot_paused ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-bot-paused/25 bg-bot-paused-surface px-2 py-1 text-sm font-medium text-bot-paused-text">
                <span className="h-1.5 w-1.5 rounded-full bg-bot-paused" />
                Pausado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-bot-active/25 bg-bot-active-surface px-2 py-1 text-sm font-medium text-bot-active-text">
                <span className="h-1.5 w-1.5 rounded-full bg-bot-active" />
                Activo
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

      {/* Order data */}
      {lead.order_data && (
        <div className="rounded-lg border border-lead-warm/25 bg-lead-warm-surface p-4">
          <p className="text-sm font-semibold text-lead-warm-text">Pedido confirmado</p>
          <pre className="mt-2 overflow-x-auto text-xs text-lead-warm-text opacity-80">
            {JSON.stringify(lead.order_data, null, 2)}
          </pre>
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
