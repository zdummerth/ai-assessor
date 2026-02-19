import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AGGREGATE_TYPES = new Set([
  "by_ward",
  "by_ward_occupancy",
  "by_cda_neighborhood",
  "by_cda_neighborhood_occupancy",
  "by_assessor_neighborhood",
  "by_assessor_neighborhood_occupancy",
]);

const FUNCTION_MAP = {
  by_ward: "parcel_aggregation_by_ward",
  by_ward_occupancy: "parcel_aggregation_by_ward_occupancy",
  by_cda_neighborhood: "parcel_aggregation_by_cda_neighborhood",
  by_cda_neighborhood_occupancy:
    "parcel_aggregation_by_cda_neighborhood_occupancy",
  by_assessor_neighborhood: "parcel_aggregation_by_assessor_neighborhood",
  by_assessor_neighborhood_occupancy:
    "parcel_aggregation_by_assessor_neighborhood_occupancy",
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const aggregateType = searchParams.get("aggregate_type") || "by_ward";

  if (!AGGREGATE_TYPES.has(aggregateType)) {
    return NextResponse.json(
      { error: "Invalid aggregate_type" },
      { status: 400 },
    );
  }

  const taxStatuses = searchParams.get("tax_statuses");
  const excludePropertyClasses = searchParams.get("exclude_property_classes");

  const parsedTaxStatuses = taxStatuses
    ? taxStatuses.split(",").map((value) => decodeURIComponent(value))
    : ["T"];

  const parsedExcludeClasses = excludePropertyClasses
    ? excludePropertyClasses
        .split(",")
        .map((value) => decodeURIComponent(value))
    : ["Exempt"];

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    FUNCTION_MAP[aggregateType as keyof typeof FUNCTION_MAP],
    {
      p_tax_statuses: parsedTaxStatuses,
      p_exclude_property_classes: parsedExcludeClasses,
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
