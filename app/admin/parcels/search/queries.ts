"use server";

import { createClient } from "@/lib/supabase/server";

type SortableColumn =
  | "parcel_id"
  | "low_address_number"
  | "street_name"
  | "owner_name"
  | "appraised_total"
  | "assessor_neighborhood"
  | "created_at"
  | "block"
  | "lot"
  | "ext"
  | "class_code"
  | "total_living_area"
  | "total_area"
  | "avg_year_built"
  | "number_of_apartments";

export async function getParcelSearchResults(
  limit = 10,
  sortColumn: SortableColumn = "parcel_id",
  sortAscending = true,
  minAppraisedTotal?: number,
  maxAppraisedTotal?: number,
  minTotalLivingArea?: number,
  maxTotalLivingArea?: number,
  minTotalArea?: number,
  maxTotalArea?: number,
  minAvgYearBuilt?: number,
  maxAvgYearBuilt?: number,
  minNumberOfApartments?: number,
  maxNumberOfApartments?: number,
) {
  const supabase = await createClient();

  let query = supabase.from("parcel_search_table").select("*");

  if (minAppraisedTotal !== undefined) {
    query = query.gte("appraised_total", minAppraisedTotal);
  }

  if (maxAppraisedTotal !== undefined) {
    query = query.lte("appraised_total", maxAppraisedTotal);
  }

  if (minTotalLivingArea !== undefined) {
    query = query.gte("total_living_area", minTotalLivingArea);
  }

  if (maxTotalLivingArea !== undefined) {
    query = query.lte("total_living_area", maxTotalLivingArea);
  }

  if (minTotalArea !== undefined) {
    query = query.gte("total_area", minTotalArea);
  }

  if (maxTotalArea !== undefined) {
    query = query.lte("total_area", maxTotalArea);
  }

  if (minAvgYearBuilt !== undefined) {
    query = query.gte("avg_year_built", minAvgYearBuilt);
  }

  if (maxAvgYearBuilt !== undefined) {
    query = query.lte("avg_year_built", maxAvgYearBuilt);
  }

  if (minNumberOfApartments !== undefined) {
    query = query.gte("number_of_apartments", minNumberOfApartments);
  }

  if (maxNumberOfApartments !== undefined) {
    query = query.lte("number_of_apartments", maxNumberOfApartments);
  }

  const { data, error } = await query
    .eq("is_active", true)
    .order(sortColumn, { ascending: sortAscending })
    .limit(limit);

  return { data, error };
}

export async function getParcelById(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parcel_search_table")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function getAssessorNeighborhoods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessor_neighborhoods")
    .select("id, name, group, geom")
    .order("name", { ascending: true });
  return { data, error };
}

export async function getCdaNeighborhoods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cda_neighborhoods")
    .select("id, name, group, geom")
    .order("name", { ascending: true });
  return { data, error };
}

export async function getWards() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wards")
    .select("id, name, group, geom")
    .order("name", { ascending: true });
  return { data, error };
}
