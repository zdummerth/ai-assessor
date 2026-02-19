"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { AggregatedBoundaryData } from "./page";
import type { AggregateType } from "./queries";
import type { MapStyle } from "@/lib/map-utils";

interface NeighborhoodExplorerMapWrapperProps {
  aggregatedData: AggregatedBoundaryData[];
  aggregateType: AggregateType;
  isLoading?: boolean;
}

const NeighborhoodExplorerMap = dynamic(
  () => import("./neighborhood-explorer-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    ),
  },
);

export default function NeighborhoodExplorerMapWrapper({
  aggregatedData,
  aggregateType,
  isLoading = false,
}: NeighborhoodExplorerMapWrapperProps) {
  const searchParams = useSearchParams();

  const mapStyleParam = searchParams.get("map_style") as MapStyle | null;
  const mapStyle = mapStyleParam || "osm";
  const colorScale = searchParams.get("color_scale") || "none";

  // Get selected neighborhood names from URL
  const filterParam = searchParams.get("filter") || "";
  const selectedNeighborhoodNames = useMemo(() => {
    if (!filterParam) return new Set<string>();
    return new Set(
      filterParam
        .split(",")
        .map((n) => decodeURIComponent(n))
        .filter((n) => n),
    );
  }, [filterParam]);

  // Filter aggregated data client-side
  const filteredData = useMemo(() => {
    if (selectedNeighborhoodNames.size === 0) return aggregatedData;

    return aggregatedData.filter((item) => {
      const name =
        item.ward_name ||
        item.cda_neighborhood_name ||
        item.assessor_neighborhood_name;
      return name && selectedNeighborhoodNames.has(name);
    });
  }, [aggregatedData, selectedNeighborhoodNames]);

  if (isLoading && aggregatedData.length === 0) {
    return (
      <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
        Loading neighborhood data...
      </div>
    );
  }

  return (
    <NeighborhoodExplorerMap
      aggregatedData={filteredData}
      aggregateType={aggregateType}
      mapStyle={mapStyle}
      colorScale={colorScale}
      selectedNeighborhoodNames={selectedNeighborhoodNames}
    />
  );
}
