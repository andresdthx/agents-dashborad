import type { Metadata } from "next";
import Link from "next/link";
import { getClients } from "@/lib/queries/clients";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Clientes | AgentsLeads",
};

export default async function AdminClientsPage() {
  const { clients } = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10">
              <Building2 className="h-4 w-4 text-signal" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-semibold text-ink">Clientes</h1>
          </div>
          <p className="mt-1 text-sm text-ink-3">
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
