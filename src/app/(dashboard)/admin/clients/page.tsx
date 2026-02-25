import Link from "next/link";
import { getClients } from "@/lib/queries/clients";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminClientsPage() {
  const { clients } = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona los negocios registrados en la plataforma
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
