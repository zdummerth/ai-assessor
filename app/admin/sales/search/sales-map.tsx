"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import type { Tables } from "@/database-types";
import { getTileConfig, type MapStyle } from "@/lib/map-utils";
import { MapUpdater } from "@/components/maps/map-components";

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

interface SalesMapProps {
  sales: Tables<"sales_summary">[];
  defaultCenter?: [number, number];
  mapStyle?: MapStyle;
  boundaries?: Boundary[];
  boundaryType?: BoundaryType;
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

export default function SalesMap({
  sales,
  defaultCenter,
  mapStyle = "osm",
  boundaries = [],
  boundaryType,
}: SalesMapProps) {
  const initialCenter = useMemo<[number, number]>(() => {
    const fallbackCenter: [number, number] = [38.627, -90.199];
    if (defaultCenter) return defaultCenter;
    return fallbackCenter;
  }, [defaultCenter]);

  const tileConfig = getTileConfig(mapStyle);

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
      center={initialCenter}
      zoom={12}
      style={{ height: "600px", width: "100%" }}
    >
      <MapUpdater center={initialCenter} />
      <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

      {/* Render sales as circle markers */}
      {sales.map((sale) => {
        if (!sale.centroid_x || !sale.centroid_y) return null;

        const position: LatLngExpression = [sale.centroid_y, sale.centroid_x];

        return (
          <CircleMarker
            key={sale.id}
            center={position}
            radius={6}
            pane="markerPane"
            pathOptions={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.7,
              weight: 2,
              opacity: 0.8,
            }}
          >
            <Popup>
              <div className="max-h-[300px] w-[280px] overflow-auto text-xs">
                <div className="font-semibold text-sm mb-2">
                  Sale {sale.sale_id}
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Price:
                    </span>
                    <span className="break-all">
                      ${sale.sale_price?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Date:
                    </span>
                    <span className="break-all">{sale.sale_date || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Appraised:
                    </span>
                    <span className="break-all">
                      ${sale.appraised_total?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Type:
                    </span>
                    <span className="break-all">{sale.sale_type || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Buildings:
                    </span>
                    <span className="break-all">
                      {sale.number_of_buildings || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Total Area:
                    </span>
                    <span className="break-all">
                      {sale.total_area || "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground">
                      Living Area:
                    </span>
                    <span className="break-all">
                      {sale.total_living_area || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      {/* Render neighborhood boundaries if available */}
      {boundaries.map((boundary, idx) => {
        if (!boundary.geom || !boundary.name) return null;

        const polygons = getPolygons(boundary.geom);

        return polygons.map((polygon, polyIdx) => (
          <Polygon
            key={`boundary-${idx}-${polyIdx}`}
            positions={polygon}
            pane="overlayPane"
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
    </MapContainer>
  );
}
