"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import SalesSearchTabs from "./sales-search-tabs";

//@ts-expect-error - I need to do this
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function SalesSearchClient() {
  const searchParams = useSearchParams();

  // Build query string from all search params
  const params = new URLSearchParams();

  // Copy all relevant params from URL
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const minDate = searchParams.get("min_date");
  const maxDate = searchParams.get("max_date");
  const condition = searchParams.get("condition");
  const occupancy = searchParams.get("occupancy");
  const cdaNeighborhood = searchParams.get("cda_neighborhood");
  const assessorNeighborhood = searchParams.get("assessor_neighborhood");
  const sort = searchParams.get("sort") || "sale_date";
  const sortAsc = searchParams.get("sort_asc") || "false";
  const limit = searchParams.get("limit") || "50";

  if (minPrice) params.set("min_price", minPrice);
  if (maxPrice) params.set("max_price", maxPrice);
  if (minDate) params.set("min_date", minDate);
  if (maxDate) params.set("max_date", maxDate);
  if (condition) params.set("condition", condition);
  if (occupancy) params.set("occupancy", occupancy);
  if (cdaNeighborhood) params.set("cda_neighborhood", cdaNeighborhood);
  if (assessorNeighborhood)
    params.set("assessor_neighborhood", assessorNeighborhood);
  params.set("sort", sort);
  params.set("sort_asc", sortAsc);
  params.set("limit", limit);

  const { data, error, isLoading, isValidating } = useSWR(
    `/api/sales-search?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    },
  );

  console.log("SalesSearchClient render", {
    data,
    error,
    isLoading,
    isValidating,
  });

  return (
    <SalesSearchTabs
      salesData={data?.data ?? []}
      isLoading={isLoading || isValidating}
      errorMessage={error instanceof Error ? error.message : null}
    />
  );
}
