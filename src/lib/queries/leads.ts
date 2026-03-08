import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/database";

export async function getLeadStats() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    { count: total },
    { count: hot },
    { count: hotConfirmed },
    { count: hotHumanActive },
    { count: warm },
    { count: cold },
    { count: todayCount },
    { count: yesterdayCount },
    { count: pausedCount },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("classification", "hot"),
    // "Confirmados": hot con order_confirmed_at seteado o score >= 100
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("classification", "hot")
      .or("score.gte.100,order_confirmed_at.not.is.null"),
    // Hot leads con bot_paused (atención humana activa)
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("classification", "hot")
      .eq("bot_paused", true),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("classification", "warm"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("classification", "cold"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString()),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("bot_paused", true),
  ]);

  const hotVal = hot ?? 0;
  const hotConfirmedVal = hotConfirmed ?? 0;
  const hotPending = hotVal - hotConfirmedVal;

  return {
    total: total ?? 0,
    hot: hotVal,
    hotConfirmed: hotConfirmedVal,
    hotPending,
    warm: warm ?? 0,
    cold: cold ?? 0,
    today: todayCount ?? 0,
    yesterday: yesterdayCount ?? 0,
    paused: pausedCount ?? 0,
    hotHumanActive: hotHumanActive ?? 0,
  };
}

export async function getLeads({
  page = 1,
  pageSize = 25,
  classification,
  botPaused,
  status,
  search,
  dateFrom,
  dateTo,
  minScore,
  sortBy = "updated_at",
  sortDir = "desc",
}: {
  page?: number;
  pageSize?: number;
  classification?: "hot" | "warm" | "cold";
  botPaused?: boolean;
  status?: "bot_active" | "human_active" | "resolved" | "lost";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minScore?: number;
  sortBy?: "score" | "created_at" | "classification" | "updated_at";
  sortDir?: "asc" | "desc";
}) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const ascending = sortDir === "asc";

  let query = supabase
    .from("leads")
    .select(
      "id, phone, classification, score, bot_paused, bot_paused_reason, bot_paused_at, status, order_confirmed_at, created_at, updated_at",
      { count: "exact" }
    )
    .order(sortBy, { ascending, nullsFirst: false })
    .range(from, to);

  // Para updated_at como sort primario, agregamos created_at como secundario
  if (sortBy === "updated_at") {
    query = query.order("created_at", { ascending: false });
  }

  if (classification) query = query.eq("classification", classification);
  if (botPaused !== undefined) query = query.eq("bot_paused", botPaused);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("phone", `%${search}%`);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) {
    // incluir el día completo del dateTo
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("created_at", endDate.toISOString().slice(0, 10));
  }
  if (minScore !== undefined) query = query.gte("score", minScore);

  const { data, count, error } = await query;
  return { leads: data ?? [], total: count ?? 0, error };
}

export async function getLeadChartData() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { data: weekRaw },
    { count: botActive },
    { count: humanActive },
    { count: resolved },
    { count: lost },
  ] = await Promise.all([
    supabase.from("leads").select("created_at").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "bot_active"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "human_active"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "lost"),
  ]);

  // Build 7-day trend array (UTC dates)
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  for (const row of weekRaw ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    const day = days.find((d) => d.date === key);
    if (day) day.count++;
  }

  return {
    weeklyTrend: days,
    statusCounts: {
      bot_active: botActive ?? 0,
      human_active: humanActive ?? 0,
      resolved: resolved ?? 0,
      lost: lost ?? 0,
    },
  };
}

export async function getLeadById(
  id: string
): Promise<{ lead: Lead | null; error: Error | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  return { lead: data as Lead | null, error: error as Error | null };
}
