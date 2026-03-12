import { getLeads } from "@/lib/queries/leads";
import { LeadsTable } from "@/components/leads/LeadsTable";

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
  sortBy?: string;
  sortDir?: string;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const pageSize = 25;

  const classification = params.classification as "hot" | "warm" | "cold" | undefined;
  const status = params.status as "bot_active" | "human_active" | "resolved" | "lost" | undefined;
  // Legacy paused param kept for backwards compat with StatsCards link
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
    : "name";

  // Cuando no hay sortDir explícito en la URL, "name" ordena asc; el resto desc
  const sortDir =
    params.sortDir === "asc" ? "asc" : params.sortDir === "desc" ? "desc" : sortBy === "name" ? "asc" : "desc";
  const minScore = params.minScore ? Number(params.minScore) : undefined;

  const { leads, total } = await getLeads({
    page,
    pageSize,
    classification,
    botPaused,
    status,
    handoffMode,
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    minScore: !isNaN(minScore ?? NaN) ? minScore : undefined,
    sortBy,
    sortDir,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Clientes</h1>
        <p className="mt-0.5 text-sm text-ink-3">
          Todos los leads calificados por el bot
        </p>
      </div>

      <LeadsTable leads={leads} total={total} page={page} pageSize={pageSize} />
    </div>
  );
}
