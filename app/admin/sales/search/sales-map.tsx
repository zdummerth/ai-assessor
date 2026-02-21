"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
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
  geometryView?: "centroids" | "parcels" | "heatmap";
}

type HeatPoint = [number, number, number];
type HeatLayerFactory = (
  points: HeatPoint[],
  options: {
    radius: number;
    blur: number;
    maxZoom: number;
    minOpacity: number;
  },
) => L.Layer;

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

function tryParseJSON(jsonString: string | null): unknown {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function HeatmapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const layer = (L as unknown as { heatLayer: HeatLayerFactory }).heatLayer(
      points,
      {
        radius: 22,
        blur: 18,
        maxZoom: 14,
        minOpacity: 0.3,
      },
    );

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
}

export default function SalesMap({
  sales,
  defaultCenter,
  mapStyle = "osm",
  boundaries = [],
  boundaryType,
  geometryView = "centroids",
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

  const heatPoints = useMemo<HeatPoint[]>(() => {
    const raw = sales
      .filter(
        (sale) =>
          typeof sale.centroid_x === "number" &&
          typeof sale.centroid_y === "number" &&
          typeof sale.sale_price === "number",
      )
      .map((sale) => ({
        lat: sale.centroid_y as number,
        lng: sale.centroid_x as number,
        price: sale.sale_price as number,
      }));

    if (raw.length === 0) return [];

    const logPrices = raw.map((point) => Math.log10(point.price + 1));
    const minLog = Math.min(...logPrices);
    const maxLog = Math.max(...logPrices);
    const range = maxLog - minLog || 1;

    return raw.map((point, index) => {
      const weight = (logPrices[index] - minLog) / range;
      return [point.lat, point.lng, Math.max(0.15, weight)] as HeatPoint;
    });
  }, [sales]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={12}
      style={{ height: "600px", width: "100%" }}
    >
      <MapUpdater center={initialCenter} />
      <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

      {geometryView === "heatmap" && heatPoints.length > 0 && (
        <HeatmapLayer points={heatPoints} />
      )}

      {/* Render sales - either as centroid markers or parcel geometries */}
      {geometryView === "centroids" &&
        sales.map((sale) => {
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
                      <span className="break-all">
                        {sale.sale_date || "N/A"}
                      </span>
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
                      <span className="break-all">
                        {sale.sale_type || "N/A"}
                      </span>
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

      {geometryView === "parcels" &&
        sales.map((sale) => {
          if (!sale.parcels_json) return null;

          const parcelsData = tryParseJSON(
            typeof sale.parcels_json === "string"
              ? sale.parcels_json
              : JSON.stringify(sale.parcels_json),
          ) as Array<{
            parcel_id: number;
            geometry: string;
            occupancy?: number;
          }> | null;

          if (!Array.isArray(parcelsData)) return null;

          return parcelsData.map((parcel, parcelIdx) => {
            if (!parcel.geometry) return null;

            // Parse the geometry string to get the actual GeoJSON
            const geometryJson = tryParseJSON(
              parcel.geometry,
            ) as GeometryValue | null;

            if (!geometryJson) return null;

            const polygons = getPolygons(geometryJson);

            return polygons.map((polygon, polyIdx) => (
              <Polygon
                key={`${sale.id}-parcel-${parcelIdx}-poly-${polyIdx}`}
                positions={polygon}
                pane="overlayPane"
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.4,
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <div className="max-h-[300px] w-[280px] overflow-auto text-xs">
                    <div className="font-semibold text-sm mb-2">
                      Sale {sale.sale_id} - Parcel {parcelIdx + 1}
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
                        <span className="break-all">
                          {sale.sale_date || "N/A"}
                        </span>
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
                          Occupancy:
                        </span>
                        <span className="break-all">
                          {parcel.occupancy || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            ));
          });
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
