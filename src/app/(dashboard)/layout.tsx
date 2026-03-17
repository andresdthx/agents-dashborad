import { redirect } from "next/navigation";
import { getSessionClientUser } from "@/lib/queries/session";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionClientUser();

  if (!session) redirect("/login");

  return (
    <DashboardShell
      role={session.role}
      userEmail={session.user.email ?? ""}
      clientId={session.client_id}
    >
      {children}
    </DashboardShell>
  );
}
