"use server";

import { createClient } from "@/lib/supabase/server";

export async function list(rangeStart = 0, rangeEnd = 9) {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("app_roles")
    .select("*, role_permissions(*)", { count: "exact" })
    .order("name", { ascending: true })
    .range(rangeStart, rangeEnd);

  return { data, error, count };
}
