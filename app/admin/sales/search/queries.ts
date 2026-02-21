"use server";

import { createClient } from "@/lib/supabase/server";

type SortableColumn =
  | "sale_id"
  | "sale_price"
  | "sale_date"
  | "appraised_total"
  | "total_living_area"
  | "total_area"
  | "created_at";

export async function getSalesSearchResults(
  limit = 10,
  sortColumn: SortableColumn = "sale_date",
  sortAscending = false,
  minSalePrice?: number,
  maxSalePrice?: number,
  minSaleDate?: string,
  maxSaleDate?: string,
  conditions?: string[],
  occupancies?: number[],
  wards?: number[],
  cdaNeighborhoods?: number[],
  assessorNeighborhoods?: number[],
  saleTypes?: string[],
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("search_sales", {
      p_sort_column: sortColumn,
      p_sort_ascending: sortAscending,
      p_min_sale_price: minSalePrice || undefined,
      p_max_sale_price: maxSalePrice || undefined,
      p_min_sale_date: minSaleDate || undefined,
      p_max_sale_date: maxSaleDate || undefined,
      p_conditions:
        conditions && conditions.length > 0 ? conditions : undefined,
      p_occupancies:
        occupancies && occupancies.length > 0 ? occupancies : undefined,
      p_wards: wards && wards.length > 0 ? wards : undefined,
      p_cda_neighborhoods:
        cdaNeighborhoods && cdaNeighborhoods.length > 0
          ? cdaNeighborhoods
          : undefined,
      p_assessor_neighborhoods:
        assessorNeighborhoods && assessorNeighborhoods.length > 0
          ? assessorNeighborhoods
          : undefined,
      p_sale_types: saleTypes && saleTypes.length > 0 ? saleTypes : undefined,
    })
    .limit(limit);

  return { data, error };
}

export async function getSalesById(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_summary")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function getConditionOptions() {
  // Return common condition types from the schema
  return {
    data: [
      { id: "Average", name: "Average" },
      { id: "Good", name: "Good" },
      { id: "Poor", name: "Poor" },
      { id: "Excellent", name: "Excellent" },
      { id: "Fair", name: "Fair" },
    ],
    error: null,
  };
}

export async function getOccupancyOptions() {
  // Return common occupancy types
  return {
    data: [
      { id: 1110, name: "Single Family" },
      { id: 1120, name: "Two Family" },
      { id: 1130, name: "Three+ Family" },
      { id: 1140, name: "Condo" },
      { id: 1150, name: "Townhouse" },
    ],
    error: null,
  };
}

export async function getCdaNeighborhoods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cda_neighborhoods")
    .select("source_id, name")
    .order("name", { ascending: true });
  return { data, error };
}

export async function getAssessorNeighborhoods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessor_neighborhoods")
    .select("id, name")
    .order("name", { ascending: true });
  return { data, error };
}
