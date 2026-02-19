"use client";

import useSWR from "swr";
import { useState } from "react";
import type { AggregateType } from "../explore/queries";

//@ts-expect-error - I need to do this
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function NeighborhoodExplorerClient() {
  const [aggregateType, setAggregateType] = useState<AggregateType>("by_ward");

  const params = new URLSearchParams({
    aggregate_type: aggregateType,
    tax_statuses: "T",
    exclude_property_classes: "Exempt",
  });

  const { data, error, isLoading, isValidating } = useSWR(
    `/api/parcel-aggregations?${params.toString()}`,
    fetcher,
    {
      //   revalidateOnFocus: false,
      //   revalidateOnReconnect: false,
      //   keepPreviousData: true,
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
    <div>
      {/* render raw data */}
      <button onClick={() => setAggregateType("by_ward")}>Set By Ward</button>
      <button onClick={() => setAggregateType("by_cda_neighborhood")}>
        Set By CDA Neighborhood
      </button>
      <pre>{JSON.stringify({ aggregateType, data, error }, null, 2)}</pre>
    </div>
  );
}
