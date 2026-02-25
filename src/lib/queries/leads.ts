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
  search,
}: {
  page?: number;
  pageSize?: number;
  classification?: "hot" | "warm" | "cold";
  botPaused?: boolean;
  search?: string;
}) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leads")
    .select(
      "id, phone, classification, score, bot_paused, bot_paused_reason, bot_paused_at, created_at, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (classification) query = query.eq("classification", classification);
  if (botPaused !== undefined) query = query.eq("bot_paused", botPaused);
  if (search) query = query.ilike("phone", `%${search}%`);

  const { data, count, error } = await query;
  return { leads: data ?? [], total: count ?? 0, error };
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
