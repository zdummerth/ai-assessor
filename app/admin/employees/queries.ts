"use server";

import { createClient } from "@/lib/supabase/server";

export async function getEmployees(limit = 20, offset = 0) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error, count: data?.length || 0 };
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
