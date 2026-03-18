import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current authenticated user and their client_users row (with client name).
 * Memoized per request with React.cache — both layout and dashboard page call this
 * function, but the DB query executes only once per server render.
 */
export const getSessionClientUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("client_users")
    .select("role, client_id, clients(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!data) return null;

  return { user, ...data };
});
