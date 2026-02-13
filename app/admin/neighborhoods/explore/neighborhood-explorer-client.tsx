"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import NeighborhoodExplorerTabs from "./neighborhood-explorer-tabs";
import type { AggregatedBoundaryData } from "./page";
import type { AggregateType } from "./queries";

const AGGREGATE_TYPES: AggregateType[] = [
  "by_ward",
  "by_ward_occupancy",
  "by_cda_neighborhood",
  "by_cda_neighborhood_occupancy",
  "by_assessor_neighborhood",
  "by_assessor_neighborhood_occupancy",
];

const fetchAggregations = async (aggregateType: AggregateType) => {
  const params = new URLSearchParams({
    aggregate_type: aggregateType,
    tax_statuses: "T",
    exclude_property_classes: "Exempt",
  });

  const response = await fetch(`/api/parcel-aggregations?${params.toString()}`);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to load neighborhood data");
  }

  const payload = (await response.json()) as {
    data: AggregatedBoundaryData[];
  };

  return payload.data ?? [];
};

export default function NeighborhoodExplorerClient() {
  const searchParams = useSearchParams();
  const aggregateTypeParam = searchParams.get("aggregate_type");

  const aggregateType = useMemo<AggregateType>(() => {
    if (
      aggregateTypeParam &&
      AGGREGATE_TYPES.includes(aggregateTypeParam as AggregateType)
    ) {
      return aggregateTypeParam as AggregateType;
    }
    return "by_ward";
  }, [aggregateTypeParam]);

  const { data, error, isLoading, isValidating } = useSWR(
    `parcel-aggregations-${aggregateType}`,
    () => fetchAggregations(aggregateType),
    {
      //   revalidateOnFocus: false,
      //   revalidateOnReconnect: false,
      //   keepPreviousData: true,
    },
  );

  return (
    <NeighborhoodExplorerTabs
      aggregatedData={data ?? []}
      aggregateType={aggregateType}
      isLoading={isLoading || isValidating}
      errorMessage={error instanceof Error ? error.message : null}
    />
  );
}
