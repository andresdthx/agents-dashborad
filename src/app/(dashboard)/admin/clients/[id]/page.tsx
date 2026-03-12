import { notFound } from "next/navigation";
import { getClientById, getPlans } from "@/lib/queries/clients";
import { getFaqsByClientId } from "@/lib/queries/faqs.server";
import { ClientForm } from "@/components/admin/ClientForm";
import { ClientTabNav } from "@/components/admin/ClientTabNav";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ client: clientData, error }, { plans }, { faqs }] = await Promise.all([
    getClientById(id),
    getPlans(),
    getFaqsByClientId(id),
  ]);

  if (error || !clientData) notFound();
  // TypeScript narrowing workaround after notFound()
  const client = clientData!;

  // Find the active sales prompt content if linked
  const salesPrompt = client.agent_prompts?.find(
    (p: { content: string; is_active: boolean }) => p.is_active
  )?.content;

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

      <ClientForm
        plans={plans}
        mode="edit"
        defaultValues={{
          id: client.id,
          name: client.name,
          business_type: client.business_type ?? "",
          channel_phone_number: client.channel_phone_number,
          plan_id: client.plan_id ?? "",
          consult_catalog_url: client.consult_catalog_url ?? "",
          active: client.active,
          promptContent: salesPrompt,
        }}
      />
    </div>
  );
}
