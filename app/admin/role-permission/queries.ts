"use server";

import { createClient } from "@/lib/supabase/server";

export async function list(rangeStart = 0, rangeEnd = 9, search?: string) {
  const supabase = await createClient();
  const query = supabase
    .from("role_permissions")
    .select("*, app_permissions(*), app_roles(*)", { count: "exact" });

  if (search !== undefined && search.trim() !== "") {
    query.ilike("permission", `%${search}%`);
  }
  const { data, error } = await query
    .order("permission", { ascending: true })
    .range(rangeStart, rangeEnd);

  return { data, error };
}
