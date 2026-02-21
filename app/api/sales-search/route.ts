import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SortableColumn =
  | "sale_id"
  | "sale_price"
  | "sale_date"
  | "appraised_total"
  | "total_living_area"
  | "total_area"
  | "created_at";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "50");
  const sortColumn =
    (searchParams.get("sort") as SortableColumn) || "sale_date";
  const sortAscending = searchParams.get("sort_asc") === "true";

  const minSalePrice = searchParams.get("min_price");
  const maxSalePrice = searchParams.get("max_price");
  const minSaleDate = searchParams.get("min_date");
  const maxSaleDate = searchParams.get("max_date");

  // Parse pipe-separated array parameters
  const conditions = searchParams.get("conditions")
    ? searchParams
        .get("conditions")!
        .split("|")
        .map((c) => c.trim())
    : undefined;
  const occupancies = searchParams.get("occupancies")
    ? searchParams
        .get("occupancies")!
        .split("|")
        .map((o) => parseInt(o.trim()))
    : undefined;
  const wards = searchParams.get("wards")
    ? searchParams
        .get("wards")!
        .split("|")
        .map((w) => parseInt(w.trim()))
    : undefined;
  const cdaNeighborhoods = searchParams.get("cda_neighborhoods")
    ? searchParams
        .get("cda_neighborhoods")!
        .split("|")
        .map((n) => parseInt(n.trim()))
    : undefined;
  const assessorNeighborhoods = searchParams.get("assessor_neighborhoods")
    ? searchParams
        .get("assessor_neighborhoods")!
        .split("|")
        .map((n) => parseInt(n.trim()))
    : undefined;
  const saleTypes = searchParams.get("sale_types")
    ? searchParams
        .get("sale_types")!
        .split("|")
        .map((s) => s.trim())
    : undefined;

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("search_sales", {
      p_sort_column: sortColumn,
      p_sort_ascending: sortAscending,
      p_min_sale_price: minSalePrice ? parseInt(minSalePrice) : undefined,
      p_max_sale_price: maxSalePrice ? parseInt(maxSalePrice) : undefined,
      p_min_sale_date: minSaleDate || undefined,
      p_max_sale_date: maxSaleDate || undefined,
      p_conditions: conditions || undefined,
      p_occupancies: occupancies || undefined,
      p_wards: wards || undefined,
      p_cda_neighborhoods: cdaNeighborhoods || undefined,
      p_assessor_neighborhoods: assessorNeighborhoods || undefined,
      p_sale_types: saleTypes || undefined,
    })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
