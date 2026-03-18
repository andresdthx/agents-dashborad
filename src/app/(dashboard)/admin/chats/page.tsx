import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminLeads } from "@/lib/queries/leads";
import { getClients } from "@/lib/queries/clients";
import { getSessionClientUser } from "@/lib/queries/session";
import { AdminChatsTable } from "@/components/admin/AdminChatsTable";

export const metadata: Metadata = {
  title: "Chats | Admin | AgentsLeads",
};

interface SearchParams {
  page?: string;
  classification?: string;
  paused?: string;
  status?: string;
  handoffMode?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minScore?: string;
  clientId?: string;
  sortBy?: string;
  sortDir?: string;
}

export default async function AdminChatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSessionClientUser();
  if (!session || session.role !== "super_admin") redirect("/dashboard");

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const pageSize = 30;

  const validClassifications = ["hot", "warm", "cold"] as const;
  type ValidClassification = (typeof validClassifications)[number];
  const classification: ValidClassification | undefined = validClassifications.includes(
    params.classification as ValidClassification
  )
    ? (params.classification as ValidClassification)
    : undefined;

  const validStatuses = ["bot_active", "human_active", "resolved", "lost"] as const;
  type ValidStatus = (typeof validStatuses)[number];
  const status: ValidStatus | undefined = validStatuses.includes(
    params.status as ValidStatus
  )
    ? (params.status as ValidStatus)
    : undefined;
  const botPaused =
    params.paused === "true" ? true : params.paused === "false" ? false : undefined;

  const validHandoffModes = ["urgent", "requested", "technical", "observer"] as const;
  type ValidHandoffMode = (typeof validHandoffModes)[number];
  const rawHandoffMode = params.handoffMode as string | undefined;
  const handoffMode: ValidHandoffMode | undefined = validHandoffModes.includes(
    rawHandoffMode as ValidHandoffMode
  )
    ? (rawHandoffMode as ValidHandoffMode)
    : undefined;

  const validSortFields = ["name", "score", "created_at", "classification", "updated_at"] as const;
  type ValidSortField = (typeof validSortFields)[number];
  const rawSortBy = params.sortBy as string | undefined;
  const sortBy: ValidSortField = validSortFields.includes(rawSortBy as ValidSortField)
    ? (rawSortBy as ValidSortField)
    : "updated_at";

  const sortDir =
    params.sortDir === "asc" ? "asc" : params.sortDir === "desc" ? "desc" : "desc";

  const rawMinScore = params.minScore ? Number(params.minScore) : undefined;
  const minScore =
    rawMinScore !== undefined && !isNaN(rawMinScore)
      ? Math.min(100, Math.max(0, rawMinScore))
      : undefined;
  const clientId = params.clientId || undefined;

  const [{ leads, total }, { clients }] = await Promise.all([
    getAdminLeads({
      page,
      pageSize,
      classification,
      botPaused,
      status,
      handoffMode,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      minScore,
      clientId,
      sortBy,
      sortDir,
    }),
    getClients(),
  ]);

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Monitor de chats</h1>
        <p className="mt-1 text-sm text-ink-3">
          Vista global de todos los leads y conversaciones — filtrable por cliente.
        </p>
      </div>
      <AdminChatsTable
        leads={leads}
        total={total}
        page={page}
        pageSize={pageSize}
        clients={clients}
      />
    </div>
  );
}
