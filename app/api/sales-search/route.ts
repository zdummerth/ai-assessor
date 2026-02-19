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
  const condition = searchParams.get("condition");
  const occupancy = searchParams.get("occupancy");
  const cdaNeighborhood = searchParams.get("cda_neighborhood");
  const assessorNeighborhood = searchParams.get("assessor_neighborhood");

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("search_sales", {
      p_sort_column: sortColumn,
      p_sort_ascending: sortAscending,
      p_min_sale_price: minSalePrice ? parseInt(minSalePrice) : undefined,
      p_max_sale_price: maxSalePrice ? parseInt(maxSalePrice) : undefined,
      p_min_sale_date: minSaleDate || undefined,
      p_max_sale_date: maxSaleDate || undefined,
      p_condition: condition || undefined,
      p_occupancy: occupancy ? parseInt(occupancy) : undefined,
      p_cda_neighborhood: cdaNeighborhood
        ? parseInt(cdaNeighborhood)
        : undefined,
      p_assessor_neighborhood: assessorNeighborhood
        ? parseInt(assessorNeighborhood)
        : undefined,
    })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
