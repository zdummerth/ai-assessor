"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxNeighborhoods } from "@/components/ui/comboboxes/combobox-neighborhoods";
import type { AggregatedBoundaryData } from "./page";
import type { AggregateType } from "./queries";

interface NeighborhoodControlsProps {
  aggregatedData: AggregatedBoundaryData[];
  aggregateType: AggregateType;
  isLoading?: boolean;
}

const AGGREGATE_OPTIONS = [
  { id: "by_ward", label: "By Ward" },
  { id: "by_ward_occupancy", label: "By Ward & Occupancy" },
  { id: "by_cda_neighborhood", label: "By CDA Neighborhood" },
  {
    id: "by_cda_neighborhood_occupancy",
    label: "By CDA Neighborhood & Occupancy",
  },
  { id: "by_assessor_neighborhood", label: "By Assessor Neighborhood" },
  {
    id: "by_assessor_neighborhood_occupancy",
    label: "By Assessor Neighborhood & Occupancy",
  },
] as const;

const MAP_STYLE_OPTIONS = [
  { id: "osm", label: "OpenStreetMap" },
  { id: "osm-hot", label: "OpenStreetMap HOT" },
  { id: "carto-light", label: "CARTO Light" },
  { id: "carto-dark", label: "CARTO Dark" },
  { id: "stadia-light", label: "Stadia Light" },
  { id: "stadia-dark", label: "Stadia Dark" },
  { id: "esri-worldimagery", label: "ESRI Satellite" },
  { id: "esri-topomap", label: "ESRI Topographic" },
] as const;

export default function NeighborhoodControls({
  aggregatedData,
  aggregateType,
  isLoading = false,
}: NeighborhoodControlsProps) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  const currentMapStyle = (searchParams.get("map_style") || "osm") as string;
  const filterParam = searchParams.get("filter") || "";
  const colorScale = searchParams.get("color_scale") || "none";

  // Extract unique neighborhood names from aggregated data
  const neighborhoodNames = useMemo(() => {
    const names = new Set<string>();
    aggregatedData.forEach((item) => {
      const name =
        item.ward_name ||
        item.cda_neighborhood_name ||
        item.assessor_neighborhood_name;
      if (name) names.add(name);
    });
    return Array.from(names).sort();
  }, [aggregatedData]);

  // Convert to format expected by combobox
  const neighborhoodItems = useMemo(
    () =>
      neighborhoodNames.map((name) => ({
        id: 0,
        name,
        group: null,
        geom: null,
      })),
    [neighborhoodNames],
  );

  // Get selected neighborhoods from URL
  const selectedNeighborhoods = useMemo(() => {
    if (!filterParam) return [];
    return filterParam
      .split(",")
      .map((n) => decodeURIComponent(n))
      .filter((n) => n);
  }, [filterParam]);

  const handleAggregateTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("aggregate_type", newType);
    params.delete("filter"); // Clear filter when changing aggregate type
    push(`${pathname}?${params.toString()}`);
  };

  const handleMapStyleChange = (mapStyle: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("map_style", mapStyle);
    push(`${pathname}?${params.toString()}`);
  };

  const handleNeighborhoodChange = (names: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (names.length === 0) {
      params.delete("filter");
    } else {
      params.set("filter", names.map((n) => encodeURIComponent(n)).join(","));
    }
    push(`${pathname}?${params.toString()}`);
  };

  const handleColorScaleChange = (scale: string) => {
    const params = new URLSearchParams(searchParams);
    if (scale === "none") {
      params.delete("color_scale");
    } else {
      params.set("color_scale", scale);
    }
    push(`${pathname}?${params.toString()}`);
  };

  const aggregateLabel =
    AGGREGATE_OPTIONS.find((opt) => opt.id === aggregateType)?.label ||
    "Unknown";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Neighborhood Explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregate Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">
            Aggregation Type
          </Label>
          <Select
            value={aggregateType}
            onValueChange={handleAggregateTypeChange}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose aggregation" />
            </SelectTrigger>
            <SelectContent>
              {AGGREGATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Map Style Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Map Style</Label>
          <Select value={currentMapStyle} onValueChange={handleMapStyleChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose a map style" />
            </SelectTrigger>
            <SelectContent>
              {MAP_STYLE_OPTIONS.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Neighborhood Filter */}
        <div className="space-y-3">
          <ComboboxNeighborhoods
            items={neighborhoodItems}
            value={selectedNeighborhoods}
            onValueChange={handleNeighborhoodChange}
            label={`Filter ${aggregateLabel}`}
            placeholder="Select neighborhoods..."
            isLoading={isLoading}
          />
        </div>

        {/* Color Scale Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Color Scale</Label>
          <Select value={colorScale} onValueChange={handleColorScaleChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose color scale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="total_appraised">Total Appraised</SelectItem>
              <SelectItem value="residential">Residential Total</SelectItem>
              <SelectItem value="commercial">Commercial Total</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Summary */}
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-semibold block">Summary</Label>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Total Records: {aggregatedData.length}</div>
            {isLoading && <div>Refreshing data...</div>}
            {selectedNeighborhoods.length > 0 && !isLoading && (
              <div>Filtered: {selectedNeighborhoods.length}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
