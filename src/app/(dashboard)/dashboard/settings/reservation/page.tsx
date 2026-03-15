import { createClient } from "@/lib/supabase/server";
import { getReservationConfig } from "@/lib/actions/reservationConfig";
import { ReservationBlockManager } from "@/components/admin/ReservationBlockManager";
import { CalendarCheck } from "lucide-react";
// CalendarCheck is also re-exported from ReservationBlockManager for convenience
import { redirect } from "next/navigation";

export default async function ReservationSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: clientUserData } = await supabase
    .from("client_users")
    .select("role, client_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!clientUserData || clientUserData.role === "super_admin") {
    redirect("/dashboard");
  }

  const clientId = clientUserData.client_id;

  if (!clientId) {
    return (
      <div className="rounded-xl border border-dashed border-edge bg-canvas py-16 text-center max-w-2xl">
        <CalendarCheck className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-ink-3">Sin cliente asignado</p>
        <p className="mt-1 text-xs text-ink-4">
          Tu cuenta aún no está vinculada a un cliente. Contacta al administrador.
        </p>
      </div>
    );
  }

  const { config } = await getReservationConfig(clientId);

  return (
    <ReservationBlockManager
      clientId={clientId}
      initialOutputFields={config?.output_fields ?? []}
      initialBlockEnabled={config?.block_enabled ?? true}
    />
  );
}
