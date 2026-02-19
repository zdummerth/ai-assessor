"use client";

import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import type { AggregatedBoundaryData } from "./page";
import type { AggregateType } from "./queries";
import { getTileConfig, type MapStyle } from "@/lib/map-utils";
import { MapUpdater, ZoomTracker } from "@/components/maps/map-components";

type GeometryValue =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

interface NeighborhoodExplorerMapProps {
  aggregatedData: AggregatedBoundaryData[];
  aggregateType: AggregateType;
  mapStyle?: MapStyle;
  colorScale?: string;
  selectedNeighborhoodNames?: Set<string>;
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

function getTooltipFontSize(zoom: number): number {
  const baseFontSize = 8;
  const minZoom = 13;
  const fontSizeIncrease = Math.max(0, zoom - minZoom) * 3;
  return baseFontSize + fontSizeIncrease;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function NeighborhoodExplorerMap({
  aggregatedData,
  aggregateType,
  mapStyle = "osm",
  colorScale = "none",
}: NeighborhoodExplorerMapProps) {
  const [currentZoom, setCurrentZoom] = useState(12);
  const TOOLTIP_MIN_ZOOM = 13;
  const showTooltips = currentZoom >= TOOLTIP_MIN_ZOOM;

  // Determine color based on aggregate type
  const baseColors = useMemo(() => {
    if (aggregateType.includes("ward")) {
      return { fill: "#ec4899", stroke: "#be185d" };
    } else if (aggregateType.includes("cda")) {
      return { fill: "#3b82f6", stroke: "#1e40af" };
    }
    return { fill: "#8b5cf6", stroke: "#6d28d9" };
  }, [aggregateType]);

  const valueScale = useMemo(() => {
    let values: number[] = [];

    switch (colorScale) {
      case "total_appraised":
        values = aggregatedData
          .map((item) => item.appraised_sum)
          .filter((value) => typeof value === "number" && !Number.isNaN(value));
        break;
      case "residential":
        values = aggregatedData
          .map((item) => item.res_total)
          .filter((value) => typeof value === "number" && !Number.isNaN(value));
        break;
      case "commercial":
        values = aggregatedData
          .map((item) => item.com_total)
          .filter((value) => typeof value === "number" && !Number.isNaN(value));
        break;
      default:
        return { min: 0, max: 0 };
    }

    if (values.length === 0) {
      return { min: 0, max: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max };
  }, [aggregatedData, colorScale]);

  const valuePalette = [
    "#00c2ff",
    "#00e5ff",
    "#7cff6b",
    "#ffe95a",
    "#ff9f1c",
    "#ff3d71",
  ];

  const getValueFillColor = (item: AggregatedBoundaryData) => {
    const { min, max } = valueScale;
    if (max <= min) return valuePalette[valuePalette.length - 1];

    let value: number = 0;
    switch (colorScale) {
      case "total_appraised":
        value = item.appraised_sum || 0;
        break;
      case "residential":
        value = item.res_total || 0;
        break;
      case "commercial":
        value = item.com_total || 0;
        break;
      default:
        return valuePalette[valuePalette.length - 1];
    }

    const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
    const index = Math.min(
      valuePalette.length - 1,
      Math.floor(ratio * (valuePalette.length - 1)),
    );
    return valuePalette[index];
  };

  const initialCenter = useMemo<[number, number]>(() => {
    return [38.627, -90.199];
  }, []);

  const tileConfig = getTileConfig(mapStyle);

  return (
    <MapContainer
      center={initialCenter}
      zoom={12}
      style={{ height: "600px", width: "100%" }}
    >
      <MapUpdater center={initialCenter} />
      <ZoomTracker onZoomChange={setCurrentZoom} />
      <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

      {aggregatedData.map((item, idx) => {
        const geom =
          item.ward_geom ||
          item.cda_neighborhood_geom ||
          item.assessor_neighborhood_geom;
        const name =
          item.ward_name ||
          item.cda_neighborhood_name ||
          item.assessor_neighborhood_name;

        if (!geom || !name) return null;

        const polygons = getPolygons(geom);

        return polygons.map((polygon, polyIdx) => (
          <Polygon
            key={`boundary-${idx}-${polyIdx}`}
            positions={polygon}
            pathOptions={{
              color: colorScale !== "none" ? "#7c2d12" : baseColors.stroke,
              fillColor:
                colorScale !== "none"
                  ? getValueFillColor(item)
                  : baseColors.fill,
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm space-y-2 min-w-[200px]">
                <div className="font-semibold text-base border-b pb-1">
                  {name}
                  {item.occupancy && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      ({item.occupancy})
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parcels:</span>
                    <span className="font-medium">
                      {formatNumber(item.parcel_count)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-medium">
                      {formatCurrency(item.appraised_sum)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Median:</span>
                    <span className="font-medium">
                      {formatCurrency(item.appraised_median)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mean:</span>
                    <span className="font-medium">
                      {formatCurrency(item.appraised_mean)}
                    </span>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Res Total:</span>
                      <span>{formatCurrency(item.res_total)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Com Total:</span>
                      <span>{formatCurrency(item.com_total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
            {showTooltips && (
              <Tooltip permanent direction="center" opacity={0.9}>
                <div
                  style={{
                    fontSize: `${getTooltipFontSize(currentZoom)}px`,
                  }}
                  className="font-semibold text-gray-900 shadow-sm whitespace-nowrap bg-transparent"
                >
                  {name}
                  {item.occupancy && ` (${item.occupancy})`}
                </div>
              </Tooltip>
            )}
          </Polygon>
        ));
      })}
    </MapContainer>
  );
}
