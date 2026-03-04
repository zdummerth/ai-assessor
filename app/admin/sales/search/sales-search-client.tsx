"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import SalesSearchTabs from "./sales-search-tabs";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String(body.error)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
};

export default function SalesSearchClient() {
  const searchParams = useSearchParams();

  // Build query string from all search params
  const params = new URLSearchParams();

  // Copy all relevant params from URL
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const minDate = searchParams.get("min_date");
  const maxDate = searchParams.get("max_date");
  const conditions = searchParams.get("conditions");
  const occupancies = searchParams.get("occupancies");
  const wards = searchParams.get("wards");
  const cdaNeighborhoods = searchParams.get("cda_neighborhoods");
  const assessorNeighborhoods = searchParams.get("assessor_neighborhoods");
  const saleTypes = searchParams.get("sale_types");
  const sort = searchParams.get("sort") || "sale_date";
  const sortAsc = searchParams.get("sort_asc") || "false";
  const limit = searchParams.get("limit") || "50";

  if (minPrice) params.set("min_price", minPrice);
  if (maxPrice) params.set("max_price", maxPrice);
  if (minDate) params.set("min_date", minDate);
  if (maxDate) params.set("max_date", maxDate);
  if (conditions) params.set("conditions", conditions);
  if (occupancies) params.set("occupancies", occupancies);
  if (wards) params.set("wards", wards);
  if (cdaNeighborhoods) params.set("cda_neighborhoods", cdaNeighborhoods);
  if (assessorNeighborhoods)
    params.set("assessor_neighborhoods", assessorNeighborhoods);
  if (saleTypes) params.set("sale_types", saleTypes);
  params.set("sort", sort);
  params.set("sort_asc", sortAsc);
  params.set("limit", limit);

  const { data, error, isLoading, isValidating } = useSWR(
    `/api/sales-search?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (error) {
    toast.error(`Error fetching sales data: ${error.message}`, {
      duration: 5000,
      closeButton: true,
    });
  }

  return (
    <SalesSearchTabs
      salesData={data?.data ?? []}
      isLoading={isLoading || isValidating}
      errorMessage={error instanceof Error ? error.message : null}
    />
  );
}
