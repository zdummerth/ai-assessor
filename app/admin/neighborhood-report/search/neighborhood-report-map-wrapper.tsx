"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { MapStyle } from "@/lib/map-utils";
import type { NeighborhoodReportRow } from "./types";

interface NeighborhoodReportMapWrapperProps {
  rows: NeighborhoodReportRow[];
  isLoading?: boolean;
}

type BoundaryType = "wards" | "cda_neighborhoods" | "assessor_neighborhoods";

//@ts-expect-error - I need to do this
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const NeighborhoodReportMapComponent = dynamic(
  () => import("./neighborhood-report-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full rounded-lg bg-muted flex items-center justify-center">
        Loading map...
      </div>
    ),
  },
);

function getCenterFromRow(
  row: NeighborhoodReportRow | undefined,
): [number, number] | null {
  if (!row?.geom) return null;

  try {
    const parsed =
      typeof row.geom === "string"
        ? (JSON.parse(row.geom) as {
            type?: string;
            coordinates?: [number, number];
          })
        : row.geom;

    if (parsed?.type !== "Point" || !parsed.coordinates) return null;
    return [parsed.coordinates[1], parsed.coordinates[0]];
  } catch {
    return null;
  }
}

export default function NeighborhoodReportMapWrapper({
  rows,
  isLoading = false,
}: NeighborhoodReportMapWrapperProps) {
  const searchParams = useSearchParams();
  const mapStyle = (searchParams.get("map_style") as MapStyle | null) || "osm";

  const showBoundaries = searchParams.get("show_boundaries") || "none";

  const defaultCenter = useMemo<[number, number]>(() => {
    const firstCenter = getCenterFromRow(rows[0]);
    return firstCenter || [38.627, -90.199];
  }, [rows]);

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
    return `/api/boundaries?${params.toString()}`;
  }, [shouldFetchBoundaries, showBoundaries]);

  const { data: boundariesData, isLoading: boundariesLoading } = useSWR(
    boundariesUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const boundaries = shouldFetchBoundaries ? (boundariesData?.data ?? []) : [];

  if (isLoading && rows.length === 0) {
    return (
      <div className="h-[600px] w-full rounded-lg bg-muted flex items-center justify-center">
        Loading map data...
      </div>
    );
  }

  return (
    <NeighborhoodReportMapComponent
      rows={rows}
      defaultCenter={defaultCenter}
      mapStyle={mapStyle}
      boundaries={boundaries}
      boundaryType={showBoundaries as BoundaryType | "none"}
      isLoading={boundariesLoading}
    />
  );
}
