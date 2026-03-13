import { createClient } from "@/lib/supabase/server";
import { getOwnClientHandoffs } from "@/lib/queries/handoffs.server";
import { HandoffRulesManager } from "@/components/admin/HandoffRulesManager";
import { ArrowLeftRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function HandoffSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientUserData } = await supabase
    .from("client_users")
    .select("role, client_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!clientUserData || clientUserData.role === "super_admin") redirect("/dashboard");

  const clientId = clientUserData.client_id;

  if (!clientId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-ink">Transferencias</h1>
          <p className="mt-1 text-sm text-ink-3">
            Define cuándo el agente debe transferir la conversación a tu equipo.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-edge bg-canvas py-16 text-center">
          <ArrowLeftRight className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-ink-3">Sin cliente asignado</p>
          <p className="mt-1 text-xs text-ink-4">
            Tu cuenta aún no está vinculada a un cliente. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  const { handoffs } = await getOwnClientHandoffs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Transferencias</h1>
        <p className="mt-1 text-sm text-ink-3">
          Define cuándo el agente debe transferir la conversación a tu equipo humano.
        </p>
      </div>

      <HandoffRulesManager clientId={clientId} initialHandoffs={handoffs} />
    </div>
  );
}
