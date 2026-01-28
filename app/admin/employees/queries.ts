"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEmployees(rangeStart = 0, rangeEnd = 9) {
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("employees")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  return { data, error, count };
}

export async function getEmployeeById(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}
