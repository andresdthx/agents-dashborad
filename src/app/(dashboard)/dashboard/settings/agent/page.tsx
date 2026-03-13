import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AgentPromptEditor } from "@/components/admin/AgentPromptEditor";
import { Bot } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AgentSettingsPage() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-ink">Agente</h1>
          <p className="mt-1 text-sm text-ink-3">
            Configura el prompt que define el comportamiento de tu agente de ventas.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-edge bg-canvas py-16 text-center">
          <Bot className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-ink-3">Sin cliente asignado</p>
          <p className="mt-1 text-xs text-ink-4">
            Tu cuenta aún no está vinculada a un cliente. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  // Cargar cliente con plan y prompt activo usando service client
  const service = createServiceClient();

  const [{ data: client }, { data: prompts }, { data: plans }] = await Promise.all([
    service.from("clients").select("id, plan_id").eq("id", clientId).single(),
    service
      .from("agent_prompts")
      .select("id, content, is_active")
      .eq("client_id", clientId)
      .eq("agent_type", "sales"),
    service
      .from("plans")
      .select("id, name")
      .eq("is_active", true),
  ]);

  const activePrompt = (prompts ?? []).find((p) => p.is_active);
  const planName = (plans ?? []).find((p) => p.id === client?.plan_id)?.name ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Agente</h1>
        <p className="mt-1 text-sm text-ink-3">
          Configura el prompt que define el comportamiento de tu agente de ventas.
        </p>
      </div>

      <AgentPromptEditor
        clientId={clientId}
        promptId={activePrompt?.id ?? null}
        initialContent={activePrompt?.content ?? ""}
        planName={planName}
      />
    </div>
  );
}
