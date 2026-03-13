import { notFound } from "next/navigation";
import { getClientById, getPlans } from "@/lib/queries/clients";
import { getFaqsByClientId } from "@/lib/queries/faqs.server";
import { AgentPromptEditor } from "@/components/admin/AgentPromptEditor";
import { ClientTabNav } from "@/components/admin/ClientTabNav";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ClientAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ client, error }, { plans }, { faqs }] = await Promise.all([
    getClientById(id),
    getPlans(),
    getFaqsByClientId(id),
  ]);

  if (error || !client) notFound();

  const activePrompt = client.agent_prompts?.find(
    (p: { id: string; content: string; is_active: boolean }) => p.is_active
  );

  const planName = plans.find((p) => p.id === client.plan_id)?.name ?? null;
  const activeFaqsCount = faqs.filter((f) => f.is_active).length;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-sm text-ink-3 transition-colors hover:text-ink-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <div>
        <h1 className="text-lg font-semibold text-ink">Editar cliente</h1>
        <p className="mt-1 text-sm text-ink-3">{client.name}</p>
      </div>

      <ClientTabNav clientId={id} activeFaqsCount={activeFaqsCount} />

      <div className="space-y-2 max-w-2xl">
        <div>
          <h2 className="text-sm font-semibold text-ink">Prompt del agente</h2>
          <p className="mt-0.5 text-sm text-ink-3">
            Instrucciones que definen la personalidad, tono y conocimiento del agente de ventas.
          </p>
        </div>

        <AgentPromptEditor
          clientId={id}
          promptId={activePrompt?.id ?? null}
          initialContent={activePrompt?.content ?? ""}
          planName={planName}
        />
      </div>
    </div>
  );
}
