import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database";

export interface ClientSummary {
  id: string;
  name: string;
  active: boolean;
  total_leads: number;
  hot: number;
  warm: number;
  cold: number;
  paused: number;
  resolved_count: number;
  lost_count: number;
  conversion_rate: number | null;
  avg_score: number | null;
}

export interface HandoffBreakdown {
  urgent: number;
  requested: number;
  technical: number;
  observer: number;
}

export interface GlobalStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  clientsWithPausedBots: number;
  totalLeads: number;
  globalHot: number;
  globalWarm: number;
  globalCold: number;
  handoffBreakdown: HandoffBreakdown;
  mrr: number;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = createServiceClient();

  const [
    { count: totalClients },
    { count: activeClients },
    { count: inactiveClients },
    { count: totalLeads },
    { count: globalHot },
    { count: globalWarm },
    { count: globalCold },
    { data: pausedClientsData },
    { data: handoffRaw },
    { data: mrrRaw },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("active", false),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("classification", "hot"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("classification", "warm"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("classification", "cold"),
    // Clientes con al menos un bot pausado
    supabase
      .from("leads")
      .select("client_id")
      .eq("bot_paused", true)
      .not("client_id", "is", null),
    // Desglose de handoffs activos por tipo
    supabase
      .from("leads")
      .select("handoff_mode")
      .eq("bot_paused", true)
      .not("handoff_mode", "is", null),
    // MRR: plan_id de cada cliente activo (luego cruzamos con tabla plans)
    supabase
      .from("clients")
      .select("plan_id")
      .eq("active", true)
      .not("plan_id", "is", null),
  ]);

  const uniquePausedClients = new Set(
    (pausedClientsData ?? []).map((l) => l.client_id).filter(Boolean)
  );

  // Calcular desglose de handoffs
  const handoffBreakdown: HandoffBreakdown = { urgent: 0, requested: 0, technical: 0, observer: 0 };
  for (const row of handoffRaw ?? []) {
    const mode = row.handoff_mode as keyof HandoffBreakdown | null;
    if (mode && mode in handoffBreakdown) {
      handoffBreakdown[mode]++;
    }
  }

  // Calcular MRR: obtener precios de los planes únicos referenciados por clientes activos
  let mrr = 0;
  if (mrrRaw && mrrRaw.length > 0) {
    const uniquePlanIds = [...new Set(mrrRaw.map((r) => r.plan_id).filter(Boolean))] as string[];
    if (uniquePlanIds.length > 0) {
      const { data: plansData } = await supabase
        .from("plans")
        .select("id, price_usd")
        .in("id", uniquePlanIds);

      const priceByPlanId = new Map((plansData ?? []).map((p) => [p.id, p.price_usd]));
      for (const row of mrrRaw) {
        const price = row.plan_id ? (priceByPlanId.get(row.plan_id) ?? 0) : 0;
        mrr += price;
      }
    }
  }

  return {
    totalClients: totalClients ?? 0,
    activeClients: activeClients ?? 0,
    inactiveClients: inactiveClients ?? 0,
    clientsWithPausedBots: uniquePausedClients.size,
    totalLeads: totalLeads ?? 0,
    globalHot: globalHot ?? 0,
    globalWarm: globalWarm ?? 0,
    globalCold: globalCold ?? 0,
    handoffBreakdown,
    mrr,
  };
}

export async function getClientsSummary(): Promise<ClientSummary[]> {
  const supabase = createServiceClient();

  // Traer todos los clientes
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, active")
    .order("name", { ascending: true });

  if (!clients || clients.length === 0) return [];

  // Traer conteos de leads con todos los campos necesarios para las métricas
  const { data: leadsRaw } = await supabase
    .from("leads")
    .select("client_id, classification, bot_paused, status, score")
    .not("client_id", "is", null);

  const leads = leadsRaw ?? [];

  // Mapear conteos por cliente
  const summaryMap = new Map<string, ClientSummary & { score_sum: number; score_count: number }>();
  for (const c of clients) {
    summaryMap.set(c.id, {
      id: c.id,
      name: c.name,
      active: c.active,
      total_leads: 0,
      hot: 0,
      warm: 0,
      cold: 0,
      paused: 0,
      resolved_count: 0,
      lost_count: 0,
      conversion_rate: null,
      avg_score: null,
      score_sum: 0,
      score_count: 0,
    });
  }

  for (const lead of leads) {
    const clientId = lead.client_id!;
    const entry = summaryMap.get(clientId);
    if (!entry) continue;
    entry.total_leads++;
    if (lead.classification === "hot") entry.hot++;
    else if (lead.classification === "warm") entry.warm++;
    else if (lead.classification === "cold") entry.cold++;
    if (lead.bot_paused) entry.paused++;
    if (lead.status === "resolved") entry.resolved_count++;
    if (lead.status === "lost") entry.lost_count++;
    if (typeof lead.score === "number") {
      entry.score_sum += lead.score;
      entry.score_count++;
    }
  }

  // Calcular conversion_rate y avg_score antes de devolver
  const result: ClientSummary[] = Array.from(summaryMap.values()).map(
    ({ score_sum, score_count, ...entry }) => {
      const finalized = entry.resolved_count + entry.lost_count;
      return {
        ...entry,
        conversion_rate: finalized > 0 ? Math.round((entry.resolved_count / finalized) * 100) : null,
        avg_score: score_count > 0 ? Math.round(score_sum / score_count) : null,
      };
    }
  );

  // Ordenar por total_leads desc (top 10 ranking)
  return result.sort((a, b) => b.total_leads - a.total_leads).slice(0, 10);
}

export async function getGlobalLeadChartData(): Promise<{
  weeklyTrend: { date: string; count: number }[];
}> {
  const supabase = createServiceClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: weekRaw } = await supabase
    .from("leads")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const dayMap = new Map<string, { date: string; count: number }>();
  for (const d of days) dayMap.set(d.date, d);
  for (const row of weekRaw ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    const day = dayMap.get(key);
    if (day) day.count++;
  }

  return { weeklyTrend: days };
}

export async function getClients() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, business_type, active, channel_phone_number, plan_id, created_at")
    .order("created_at", { ascending: false });

  return { clients: data ?? [], error };
}

export async function getClientById(id: string) {
  const supabase = createServiceClient();

  // Two separate queries to avoid join type inference issues
  const [{ data: client, error }, { data: prompts }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("agent_prompts")
      .select("id, content, agent_type, is_active")
      .eq("client_id", id)
      .eq("agent_type", "sales"),
  ]);

  return {
    client: client
      ? { ...client, agent_prompts: prompts ?? [] }
      : null,
    error,
  };
}

export async function getPlans() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, display_name, price_usd")
    .eq("is_active", true)
    .order("price_usd", { ascending: true });

  return { plans: data ?? [], error };
}

export async function createClientRecord(
  input: Database["public"]["Tables"]["clients"]["Insert"]
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("clients")
    .insert(input)
    .select()
    .single();

  return { client: data, error };
}

export async function updateClientRecord(
  id: string,
  input: Database["public"]["Tables"]["clients"]["Update"]
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("clients")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { client: data, error };
}
