"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Tables } from "@/database-types";
import type { MapStyle } from "@/lib/map-utils";

interface SalesMapWrapperProps {
  sales: Tables<"sales_summary">[];
  isLoading?: boolean;
}

type BoundaryType = "wards" | "cda_neighborhoods" | "assessor_neighborhoods";

//@ts-expect-error - I need to do this
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const SalesMapComponent = dynamic(() => import("./sales-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

function getCenterFromSale(
  sale: Tables<"sales_summary"> | undefined,
): [number, number] | null {
  if (!sale || !sale.centroid_x || !sale.centroid_y) return null;
  return [sale.centroid_y, sale.centroid_x];
}

export default function SalesMapWrapper({
  sales,
  isLoading: salesLoading = false,
}: SalesMapWrapperProps) {
  const searchParams = useSearchParams();

  const mapStyleParam = searchParams.get("map_style") as MapStyle | null;
  const mapStyle = mapStyleParam || "osm";

  const showBoundaries = searchParams.get("show_boundaries") || "none";
  const wards = searchParams.get("wards") || "";
  const cdaNeighborhoods = searchParams.get("cda_neighborhoods") || "";
  const assessorNeighborhoods =
    searchParams.get("assessor_neighborhoods") || "";
  const geometryView =
    (searchParams.get("geometry_view") as
      | "centroids"
      | "parcels"
      | "heatmap") || "centroids";

  // Fetch boundaries if needed
  const shouldFetchBoundaries =
    showBoundaries !== "none" &&
    ["wards", "cda_neighborhoods", "assessor_neighborhoods"].includes(
      showBoundaries,
    );

  const boundariesUrl = useMemo(() => {
    if (!shouldFetchBoundaries) {
      return null;
    }

    const params = new URLSearchParams({ type: showBoundaries });

    if (showBoundaries === "wards" && wards) {
      params.set("ids", wards);
    }

    if (showBoundaries === "cda_neighborhoods" && cdaNeighborhoods) {
      params.set("ids", cdaNeighborhoods);
    }

    if (showBoundaries === "assessor_neighborhoods" && assessorNeighborhoods) {
      params.set("ids", assessorNeighborhoods);
    }

    return `/api/boundaries?${params.toString()}`;
  }, [
    shouldFetchBoundaries,
    showBoundaries,
    wards,
    cdaNeighborhoods,
    assessorNeighborhoods,
  ]);

  const { data: boundariesData, isLoading: boundariesLoading } = useSWR(
    boundariesUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const boundaries = shouldFetchBoundaries ? (boundariesData?.data ?? []) : [];

  const defaultCenter = useMemo<[number, number]>(() => {
    const firstCenter = getCenterFromSale(sales[0]);
    return firstCenter || ([38.627, -90.199] as [number, number]);
  }, [sales]);

  if ((salesLoading || boundariesLoading) && sales.length === 0) {
    return (
      <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
        Loading map data...
      </div>
    );
  }

  return (
    <SalesMapComponent
      sales={sales}
      defaultCenter={defaultCenter}
      mapStyle={mapStyle}
      boundaries={boundaries}
      boundaryType={showBoundaries as BoundaryType}
      geometryView={geometryView}
    />
  );
}
