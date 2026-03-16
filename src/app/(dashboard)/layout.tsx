import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ClientUser } from "@/types/database";
import { DashboardShell } from "@/components/layout/DashboardShell";

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
    <DashboardShell
      role={clientUser.role}
      userEmail={user.email ?? ""}
      clientId={clientUser.client_id}
    >
      {children}
    </DashboardShell>
  );
}
