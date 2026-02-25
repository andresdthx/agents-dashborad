import { getPlans } from "@/lib/queries/clients";
import { ClientForm } from "@/components/admin/ClientForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewClientPage() {
  const { plans } = await getPlans();

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
        <h1 className="text-2xl font-bold">Nuevo cliente</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Crea un nuevo negocio y configura su agente de ventas
        </p>
      </div>

      <ClientForm plans={plans} mode="create" />
    </div>
  );
}
