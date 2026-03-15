import { createClient } from "@/lib/supabase/server";
import { getCatalogConfig } from "@/lib/actions/catalogConfig";
import { CatalogColMappingManager } from "@/components/admin/CatalogColMappingManager";
import { TableProperties } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CatalogSettingsPage() {
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
        <TableProperties className="mx-auto h-8 w-8 text-ink-4" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-ink-3">Sin cliente asignado</p>
        <p className="mt-1 text-xs text-ink-4">
          Tu cuenta aún no está vinculada a un cliente. Contacta al administrador.
        </p>
      </div>
    );
  }

  // Detectar si el cliente usa Google Sheets como fuente del catálogo
  const { data: clientData } = await supabase
    .from("clients")
    .select("consult_catalog_url")
    .eq("id", clientId)
    .single();

  const consultUrl = clientData?.consult_catalog_url ?? "";
  const isGoogleSheet =
    consultUrl.includes("docs.google.com/spreadsheets") ||
    consultUrl.includes("sheets.googleapis.com");

  const { config } = await getCatalogConfig(clientId);

  return (
    <CatalogColMappingManager
      clientId={clientId}
      initialConfig={config}
      isGoogleSheet={isGoogleSheet}
    />
  );
}
