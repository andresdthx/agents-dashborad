import { getLeads } from "@/lib/queries/leads";
import { LeadsTable } from "@/components/leads/LeadsTable";

interface SearchParams {
  page?: string;
  classification?: string;
  paused?: string;
  status?: string;
  search?: string;
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

  const { leads, total } = await getLeads({
    page,
    pageSize,
    classification,
    botPaused,
    status,
    search: params.search,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Leads</h1>
        <p className="mt-0.5 text-sm text-ink-3">
          Todos los leads calificados por el bot
        </p>
      </div>

      <LeadsTable leads={leads} total={total} page={page} pageSize={pageSize} />
    </div>
  );
}
