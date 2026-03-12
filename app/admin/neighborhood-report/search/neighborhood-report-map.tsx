"use client";

import { useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Polygon,
  Pane,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTileConfig, type MapStyle } from "@/lib/map-utils";
import { MapUpdater } from "@/components/maps/map-components";
import { AddressWithMap } from "@/components/ui/address-with-map";
import type { NeighborhoodReportRow, MapPointGeometry } from "./types";

type BoundaryType = "wards" | "cda_neighborhoods" | "assessor_neighborhoods";

type GeometryValue =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

interface Boundary {
  id?: number;
  source_id?: string;
  name: string;
  geom: GeometryValue | null;
}

interface NeighborhoodReportMapProps {
  rows: NeighborhoodReportRow[];
  defaultCenter: [number, number];
  mapStyle?: MapStyle;
  boundaries?: Boundary[];
  boundaryType?: BoundaryType | "none";
  isLoading?: boolean;
}

function parsePointGeometry(value: NeighborhoodReportRow["geom"]) {
  if (!value) return null;

  let geometry: MapPointGeometry | null = null;

  if (typeof value === "string") {
    try {
      geometry = JSON.parse(value) as MapPointGeometry;
    } catch {
      return null;
    }
  } else {
    geometry = value as MapPointGeometry;
  }

  if (geometry?.type !== "Point") return null;
  const [lng, lat] = geometry.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return [lat, lng] as LatLngExpression;
}

function convertPolygonToLatLng(
  coordinates: number[][][],
): LatLngExpression[][] {
  return coordinates.map((ring) =>
    ring.map(([lng, lat]) => [lat, lng] as LatLngExpression),
  );
}

function getPolygons(geometry: GeometryValue | null): LatLngExpression[][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    return [convertPolygonToLatLng(geometry.coordinates)];
  }
  return geometry.coordinates.map((polygon) => convertPolygonToLatLng(polygon));
}

export default function NeighborhoodReportMap({
  rows,
  defaultCenter,
  mapStyle = "osm",
  boundaries = [],
  boundaryType = "none",
  isLoading = false,
}: NeighborhoodReportMapProps) {
  const tileConfig = getTileConfig(mapStyle);

  const points = useMemo(
    () =>
      rows
        .map((row) => ({ row, position: parsePointGeometry(row.geom) }))
        .filter(
          (
            item,
          ): item is {
            row: NeighborhoodReportRow;
            position: LatLngExpression;
          } => Boolean(item.position),
        ),
    [rows],
  );

  // Determine boundary colors
  const boundaryColors = useMemo(() => {
    if (boundaryType === "wards") {
      return { fill: "#ec4899", stroke: "#be185d" };
    } else if (boundaryType === "cda_neighborhoods") {
      return { fill: "#3b82f6", stroke: "#1e40af" };
    } else if (boundaryType === "assessor_neighborhoods") {
      return { fill: "#8b5cf6", stroke: "#6d28d9" };
    }
    return { fill: "#94a3b8", stroke: "#475569" };
  }, [boundaryType]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "600px", width: "100%" }}
    >
      <Pane name="boundariesPane" style={{ zIndex: 380 }} />
      <Pane name="neighborhoodMarkersPane" style={{ zIndex: 650 }} />

      <MapUpdater center={defaultCenter} />
      <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

      {/* Render neighborhood boundaries if available */}
      {boundaries.map((boundary, idx) => {
        if (!boundary.geom || !boundary.name) return null;

        const polygons = getPolygons(boundary.geom);

        return polygons.map((polygon, polyIdx) => (
          <Polygon
            key={`boundary-${idx}-${polyIdx}`}
            positions={polygon}
            pane="boundariesPane"
            pathOptions={{
              color: boundaryColors.stroke,
              fillColor: boundaryColors.fill,
              fillOpacity: 0.1,
              weight: 2,
              opacity: 0.6,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{boundary.name}</div>
              </div>
            </Popup>
          </Polygon>
        ));
      })}

      {points.map(({ row, position }) => (
        <CircleMarker
          key={row.id}
          center={position}
          radius={6}
          pane="neighborhoodMarkersPane"
          pathOptions={{
            color: "#dc2626",
            fillColor: "#f87171",
            fillOpacity: 0.75,
            weight: 2,
          }}
        >
          <Popup>
            <div className="max-h-[300px] w-[280px] overflow-auto text-xs">
              <div className="mb-2 text-sm font-semibold">
                Parcel {row.parcel_id}
              </div>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Neighborhood:</span>{" "}
                  {row.neighborhood || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Report Address:</span>{" "}
                  <AddressWithMap address={row.address} fallback="N/A" />
                </div>
                <div>
                  <span className="font-medium">Year Built:</span>{" "}
                  {row.year_built || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Total Area:</span>{" "}
                  {row.total_area || "N/A"}
                </div>
                <div>
                  <span className="font-medium">GLA:</span> {row.gla || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{" "}
                  {row.total || "N/A"}
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
