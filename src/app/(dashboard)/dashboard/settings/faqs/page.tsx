import { createClient } from "@/lib/supabase/server";
import { getOwnClientFaqs } from "@/lib/queries/faqs.server";
import { ClientFaqsManager } from "@/components/admin/ClientFaqsManager";
import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AgentFaqsPage() {
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
        <MessageSquare className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-ink-3">Sin cliente asignado</p>
        <p className="mt-1 text-xs text-ink-4">
          Tu cuenta aún no está vinculada a un cliente. Contacta al administrador.
        </p>
      </div>
    );
  }

  const { faqs } = await getOwnClientFaqs();

  return <ClientFaqsManager clientId={clientId} initialFaqs={faqs} />;
}
