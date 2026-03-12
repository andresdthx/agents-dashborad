import { notFound } from "next/navigation";
import { getClientById } from "@/lib/queries/clients";
import { getFaqsByClientId } from "@/lib/queries/faqs.server";
import { ClientFaqsManager } from "@/components/admin/ClientFaqsManager";
import { ClientTabNav } from "@/components/admin/ClientTabNav";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ClientFaqsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ client, error }, { faqs }] = await Promise.all([
    getClientById(id),
    getFaqsByClientId(id),
  ]);

  if (error || !client) notFound();

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

      <div className="space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-ink">Preguntas frecuentes</h2>
          <p className="mt-0.5 text-sm text-ink-3">
            Define respuestas automáticas para las preguntas más comunes de los clientes.
          </p>
        </div>

        <ClientFaqsManager clientId={id} initialFaqs={faqs} />
      </div>
    </div>
  );
}
