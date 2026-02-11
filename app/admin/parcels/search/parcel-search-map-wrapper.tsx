"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Tables } from "@/database-types";

type GeometryValue =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

type BoundaryData = {
  id: number;
  name: string;
  group: string | null;
  geom: GeometryValue | null;
};

type MapStyle =
  | "osm"
  | "carto-light"
  | "carto-dark"
  | "stadia-light"
  | "stadia-dark";

interface ParcelSearchMapWrapperProps {
  parcels: Tables<"parcel_search_table">[];
  assessorNeighborhoods: BoundaryData[];
  cdaNeighborhoods: BoundaryData[];
  wards: BoundaryData[];
}

function getCenterFromParcel(
  parcel: Tables<"parcel_search_table"> | undefined,
): [number, number] | null {
  if (!parcel) return null;
  const geometry = parcel.geometry as GeometryValue | null;
  if (!geometry) return null;

  const coordinates =
    geometry.type === "Polygon"
      ? geometry.coordinates
      : geometry.coordinates[0];

  const firstRing = coordinates?.[0];
  if (!firstRing || firstRing.length === 0) return null;
  const [lng, lat] = firstRing[0];
  return [lat, lng];
}

const ParcelSearchMap = dynamic(() => import("./parcel-search-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function ParcelSearchMapWrapper({
  parcels,
  assessorNeighborhoods,
  cdaNeighborhoods,
  wards,
}: ParcelSearchMapWrapperProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();
  const focusParcelIdParam = searchParams.get("focus_parcel_id");
  const focusParcelId = focusParcelIdParam
    ? parseInt(focusParcelIdParam, 10)
    : undefined;

  const boundaryParam = searchParams.get("boundary") as
    | "none"
    | "cda"
    | "assessor"
    | "ward"
    | null;
  const boundaryType = boundaryParam || "none";

  const mapStyleParam = searchParams.get("map_style") as MapStyle | null;
  const mapStyle = mapStyleParam || "osm";

  const urlLat = searchParams.get("center_lat");
  const urlLng = searchParams.get("center_lng");
  const defaultCenter = useMemo<[number, number]>(() => {
    if (urlLat && urlLng) {
      const lat = Number(urlLat);
      const lng = Number(urlLng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return [lat, lng] as [number, number];
      }
    }
    const firstCenter = getCenterFromParcel(parcels[0]);
    return firstCenter || ([38.627, -90.199] as [number, number]);
  }, [urlLat, urlLng, parcels]);

  useEffect(() => {
    if (!urlLat || !urlLng) {
      const params = new URLSearchParams(searchParams);
      params.set("center_lat", defaultCenter[0].toString());
      params.set("center_lng", defaultCenter[1].toString());
      push(`${pathname}?${params.toString()}`);
    }
  }, [urlLat, urlLng, defaultCenter, searchParams, pathname, push]);

  return (
    <ParcelSearchMap
      parcels={parcels}
      focusParcelId={focusParcelId}
      defaultCenter={defaultCenter}
      boundaryType={boundaryType}
      mapStyle={mapStyle}
      assessorNeighborhoods={assessorNeighborhoods}
      cdaNeighborhoods={cdaNeighborhoods}
      wards={wards}
    />
  );
}
