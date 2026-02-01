"use server";

import { createClient } from "@/lib/supabase/server";

export async function getParcelGeometries(limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("geometries")
    .select("id, parcel_id, parcel_number, geom")
    .order("id", { ascending: true })
    .limit(limit);

  return { data, error };
}
