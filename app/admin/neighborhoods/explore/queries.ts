"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export type AggregateType =
  | "by_ward"
  | "by_ward_occupancy"
  | "by_cda_neighborhood"
  | "by_cda_neighborhood_occupancy"
  | "by_assessor_neighborhood"
  | "by_assessor_neighborhood_occupancy";

export async function getParcelAggregations(
  aggregateType: AggregateType,
  taxStatuses: string[] | null = null,
  excludePropertyClasses: string[] | null = null,
) {
  const supabase = await createClient();

  const functionMap = {
    by_ward: "parcel_aggregation_by_ward",
    by_ward_occupancy: "parcel_aggregation_by_ward_occupancy",
    by_cda_neighborhood: "parcel_aggregation_by_cda_neighborhood",
    by_cda_neighborhood_occupancy:
      "parcel_aggregation_by_cda_neighborhood_occupancy",
    by_assessor_neighborhood: "parcel_aggregation_by_assessor_neighborhood",
    by_assessor_neighborhood_occupancy:
      "parcel_aggregation_by_assessor_neighborhood_occupancy",
  };

  //@ts-expect-error - I need to figure out dynamic types for the rpc function parameters
  const { data, error } = await supabase.rpc(functionMap[aggregateType], {
    p_tax_statuses: taxStatuses,
    p_exclude_property_classes: excludePropertyClasses,
  });

  return { data, error };
}

export const getParcelAggregationsCached = unstable_cache(
  async (
    aggregateType: AggregateType,
    taxStatuses: string[] | null = null,
    excludePropertyClasses: string[] | null = null,
  ) =>
    getParcelAggregations(aggregateType, taxStatuses, excludePropertyClasses),
  ["parcel-aggregations"],
  { revalidate: 300 },
);
