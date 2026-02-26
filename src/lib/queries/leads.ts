import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/database";

export async function getLeadStats() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ count: total }, { data: byClass }, { count: todayCount }, { count: pausedCount }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("classification, bot_paused").not("classification", "is", null),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("bot_paused", true),
    ]);

  const hot = byClass?.filter((l) => l.classification === "hot").length ?? 0;
  const warm = byClass?.filter((l) => l.classification === "warm").length ?? 0;
  const cold = byClass?.filter((l) => l.classification === "cold").length ?? 0;
  const hotHumanActive =
    byClass?.filter((l) => l.classification === "hot" && l.bot_paused === true).length ?? 0;

  return {
    total: total ?? 0,
    hot,
    warm,
    cold,
    today: todayCount ?? 0,
    paused: pausedCount ?? 0,
    hotHumanActive,
  };
}

export async function getLeads({
  page = 1,
  pageSize = 25,
  classification,
  botPaused,
  status,
  search,
}: {
  page?: number;
  pageSize?: number;
  classification?: "hot" | "warm" | "cold";
  botPaused?: boolean;
  status?: "bot_active" | "human_active" | "resolved" | "lost";
  search?: string;
}) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leads")
    .select(
      "id, phone, classification, score, bot_paused, bot_paused_reason, bot_paused_at, status, created_at, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (classification) query = query.eq("classification", classification);
  if (botPaused !== undefined) query = query.eq("bot_paused", botPaused);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("phone", `%${search}%`);

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
