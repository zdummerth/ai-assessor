"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import NeighborhoodReportSearchTabs from "./neighborhood-report-search-tabs";
import type { NeighborhoodReportRow } from "./types";

type NeighborhoodReportResponse = {
  data: NeighborhoodReportRow[];
};

const fetcher = async (url: string): Promise<NeighborhoodReportResponse> => {
  const response = await fetch(url);
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String(body.error)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as NeighborhoodReportResponse;
};

export default function NeighborhoodReportSearchClient() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams();

  const relevantKeys = [
    "year",
    "neighborhoods",
    "occupancies",
    "cost_groups",
    "cdus",
    "grades",
    "min_year_built",
    "max_year_built",
    "min_total_area",
    "max_total_area",
    "min_gla",
    "max_gla",
    "min_story",
    "max_story",
    "min_total",
    "max_total",
    "sort",
    "sort_asc",
    "limit",
    "map_style",
    "show_boundaries",
  ] as const;

  relevantKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      params.set(key, value);
    }
  });

  if (!params.has("sort")) params.set("sort", "report_timestamp");
  if (!params.has("sort_asc")) params.set("sort_asc", "false");
  if (!params.has("limit")) params.set("limit", "50");
  if (!params.has("year")) params.set("year", "2026");

  const { data, error, isLoading } = useSWR(
    `/api/neighborhood-report-search?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  if (error) {
    toast.error(`Error fetching neighborhood report data: ${error.message}`, {
      duration: 5000,
      closeButton: true,
    });
  }

  return (
    <NeighborhoodReportSearchTabs
      rows={data?.data ?? []}
      isLoading={isLoading}
      errorMessage={error instanceof Error ? error.message : null}
    />
  );
}
