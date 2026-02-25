import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ClientUser } from "@/types/database";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawClientUser } = await supabase
    .from("client_users")
    .select("role, client_id")
    .eq("user_id", user.id)
    .single();

  if (!rawClientUser) redirect("/login");
  const clientUser = rawClientUser as Pick<ClientUser, "role" | "client_id">;

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar role={clientUser.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar userEmail={user.email ?? ""} clientId={clientUser.client_id} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
