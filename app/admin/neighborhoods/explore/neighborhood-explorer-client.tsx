"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import NeighborhoodExplorerTabs from "./neighborhood-explorer-tabs";
import type { AggregateType } from "./queries";

const AGGREGATE_TYPES: AggregateType[] = [
  "by_ward",
  "by_ward_occupancy",
  "by_cda_neighborhood",
  "by_cda_neighborhood_occupancy",
  "by_assessor_neighborhood",
  "by_assessor_neighborhood_occupancy",
];

//@ts-expect-error - I need to do this
const fetcher = (...args) => fetch(...args).then((res) => res.json());

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

  const params = new URLSearchParams({
    aggregate_type: aggregateType,
    tax_statuses: "T",
    exclude_property_classes: "Exempt",
  });

  const { data, error, isLoading, isValidating } = useSWR(
    `/api/parcel-aggregations?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    },
  );

  console.log("NeighborhoodExplorerClient render", {
    aggregateType,
    data,
    error,
    isLoading,
    isValidating,
  });

  return (
    <NeighborhoodExplorerTabs
      aggregatedData={data?.data ?? []}
      aggregateType={aggregateType}
      isLoading={isLoading || isValidating}
      errorMessage={error instanceof Error ? error.message : null}
    />
  );
}
