"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/database-types";

interface SearchControlsProps {
  salesData: Tables<"sales_summary">[];
  isLoading?: boolean;
}

const CONDITION_OPTIONS = [
  { id: "Average", name: "Average" },
  { id: "Good", name: "Good" },
  { id: "Poor", name: "Poor" },
  { id: "Excellent", name: "Excellent" },
  { id: "Fair", name: "Fair" },
] as const;

const OCCUPANCY_OPTIONS = [
  { id: 1110, name: "Single Family" },
  { id: 1120, name: "Two Family" },
  { id: 1130, name: "Three+ Family" },
  { id: 1140, name: "Condo" },
  { id: 1150, name: "Townhouse" },
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

const BOUNDARY_OPTIONS = [
  { id: "none", label: "None" },
  { id: "wards", label: "Wards" },
  { id: "cda_neighborhoods", label: "CDA Neighborhoods" },
  { id: "assessor_neighborhoods", label: "Assessor Neighborhoods" },
] as const;

const SORT_COLUMN_OPTIONS = [
  { id: "sale_date", label: "Sale Date" },
  { id: "sale_price", label: "Sale Price" },
  { id: "sale_id", label: "Sale ID" },
  { id: "appraised_total", label: "Appraised Total" },
  { id: "total_living_area", label: "Living Area" },
  { id: "total_area", label: "Total Area" },
  { id: "created_at", label: "Created At" },
] as const;

const SORT_DIRECTION_OPTIONS = [
  { id: "false", label: "Descending" },
  { id: "true", label: "Ascending" },
] as const;

export default function SearchControls({
  salesData,
  isLoading = false,
}: SearchControlsProps) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  const currentMapStyle = searchParams.get("map_style") || "osm";
  const showBoundaries = searchParams.get("show_boundaries") || "none";
  const sortColumn = searchParams.get("sort") || "sale_date";
  const sortAsc = searchParams.get("sort_asc") || "false";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const minDate = searchParams.get("min_date") || "";
  const maxDate = searchParams.get("max_date") || "";
  const condition = searchParams.get("condition") || "";
  const occupancy = searchParams.get("occupancy") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    push(`${pathname}?${params.toString()}`);
  };

  const handleMapStyleChange = (mapStyle: string) => {
    updateParam("map_style", mapStyle);
  };

  const handleBoundariesChange = (boundaries: string) => {
    updateParam("show_boundaries", boundaries);
  };

  const handleMinPriceChange = (value: string) => {
    updateParam("min_price", value);
  };

  const handleMaxPriceChange = (value: string) => {
    updateParam("max_price", value);
  };

  const handleMinDateChange = (value: string) => {
    updateParam("min_date", value);
  };

  const handleMaxDateChange = (value: string) => {
    updateParam("max_date", value);
  };

  const handleConditionChange = (value: string) => {
    updateParam("condition", value);
  };

  const handleOccupancyChange = (value: string) => {
    updateParam("occupancy", value);
  };

  const handleSortColumnChange = (value: string) => {
    updateParam("sort", value);
  };

  const handleSortDirectionChange = (value: string) => {
    updateParam("sort_asc", value);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    // Keep map style, boundaries, and sort settings
    if (currentMapStyle !== "osm") params.set("map_style", currentMapStyle);
    if (showBoundaries !== "none")
      params.set("show_boundaries", showBoundaries);
    if (sortColumn !== "sale_date") params.set("sort", sortColumn);
    if (sortAsc !== "false") params.set("sort_asc", sortAsc);
    push(`${pathname}?${params.toString()}`);
  };

  const priceRange = useMemo(() => {
    if (salesData.length === 0) return { min: 0, max: 0, avg: 0 };
    const prices = salesData
      .map((s) => s.sale_price)
      .filter((p): p is number => p !== null);
    if (prices.length === 0) return { min: 0, max: 0, avg: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }, [salesData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sales Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort Controls */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Sort By</Label>
          <Select value={sortColumn} onValueChange={handleSortColumnChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose sort column" />
            </SelectTrigger>
            <SelectContent>
              {SORT_COLUMN_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Direction */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Sort Direction</Label>
          <Select value={sortAsc} onValueChange={handleSortDirectionChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose direction" />
            </SelectTrigger>
            <SelectContent>
              {SORT_DIRECTION_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* mFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sales Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* Neighborhood Boundaries */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Show Boundaries</Label>
          <Select value={showBoundaries} onValueChange={handleBoundariesChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose boundaries" />
            </SelectTrigger>
            <SelectContent>
              {BOUNDARY_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={minDate}
              onChange={(e) => handleMinDateChange(e.target.value)}
            />
            <Input
              type="date"
              value={maxDate}
              onChange={(e) => handleMaxDateChange(e.target.value)}
            />
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Condition</Label>
          <Select value={condition} onValueChange={handleConditionChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="All conditions" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Occupancy */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Occupancy</Label>
          <Select value={occupancy} onValueChange={handleOccupancyChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="All occupancies" />
            </SelectTrigger>
            <SelectContent>
              {OCCUPANCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="pt-2">
          <button
            onClick={handleClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear Filters
          </button>
        </div>

        {/* Statistics Summary */}
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-semibold block">Summary</Label>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Total Sales: {salesData.length}</div>
            {isLoading && <div>Refreshing data...</div>}
            {salesData.length > 0 && (
              <>
                <div>Avg Price: {formatCurrency(priceRange.avg)}</div>
                <div className="text-xs">
                  Range: {formatCurrency(priceRange.min)} -{" "}
                  {formatCurrency(priceRange.max)}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
