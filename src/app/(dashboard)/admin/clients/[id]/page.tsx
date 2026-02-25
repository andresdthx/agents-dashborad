import { notFound } from "next/navigation";
import { getClientById, getPlans } from "@/lib/queries/clients";
import { ClientForm } from "@/components/admin/ClientForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ client: clientData, error }, { plans }] = await Promise.all([
    getClientById(id),
    getPlans(),
  ]);

  if (error || !clientData) notFound();
  // TypeScript narrowing workaround after notFound()
  const client = clientData!;

  // Find the active sales prompt content if linked
  const salesPrompt = client.agent_prompts?.find(
    (p: { content: string; is_active: boolean }) => p.is_active
  )?.content;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar cliente</h1>
        <p className="mt-1 text-sm text-zinc-500">{client.name}</p>
      </div>

      <ClientForm
        plans={plans}
        mode="edit"
        defaultValues={{
          id: client.id,
          name: client.name,
          business_type: client.business_type ?? "",
          channel_phone_number: client.channel_phone_number,
          plan_id: client.plan_id ?? "",
          product_mode: client.product_mode,
          catalog_url: client.catalog_url ?? "",
          active: client.active,
          promptContent: salesPrompt,
        }}
      />
    </div>
  );
}
