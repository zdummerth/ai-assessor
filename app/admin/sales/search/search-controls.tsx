"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxGeneric } from "@/components/ui/comboboxes/combobox-generic";
import { ComboboxGenericSWR } from "@/components/ui/comboboxes/combobox-generic-swr";
import type { Tables } from "@/database-types";

interface SearchControlsProps {
  salesData: Tables<"sales_summary">[];
  isLoading?: boolean;
}

const CONDITION_OPTIONS = [
  { id: "Average", name: "Average" },
  { id: "Good", name: "Good" },
  { id: "Poor", name: "Poor" },
  { id: "Unsound", name: "Unsound" },
  { id: "Excellent", name: "Excellent" },
  { id: "Fair", name: "Fair" },
  { id: "Very Good", name: "Very Good" },
] as const;

const OCCUPANCY_OPTIONS = [
  { id: 1110, name: "Single Family" },
  { id: 1120, name: "Two Family" },
  { id: 1130, name: "Three Family" },
  { id: 1140, name: "Four Family" },
  { id: 1114, name: "Condo < 6 Units" },
  { id: 1115, name: "Condo 6+ Units" },
  { id: 1150, name: "Townhouse" },
  { id: 1010, name: "Residential Vacant Land" },
  { id: 1185, name: "Apartments" },
] as const;

const SALE_TYPE_OPTIONS = [
  { id: "FORECLOSURE", name: "FORECLOSURE" },
  { id: "MULTIPLE LOCATIONS", name: "MULTIPLE LOCATIONS" },
  { id: "PROBATE", name: "PROBATE" },
  { id: "BUYER & SELLER RELATED", name: "BUYER & SELLER RELATED" },
  {
    id: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/NON-ADJUSTED - INVALID",
    name: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/NON-ADJUSTED - INVALID",
  },
  {
    id: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/NON-ADJUSTED - VALID",
    name: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/NON-ADJUSTED - VALID",
  },
  { id: "SOLD FROM LRA", name: "SOLD FROM LRA" },
  {
    id: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/ADJUSTED - INVALID",
    name: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/ADJUSTED - INVALID",
  },
  {
    id: "IMPROVED, OPEN MARKET, ARMS LENGTH",
    name: "IMPROVED, OPEN MARKET, ARMS LENGTH",
  },
  { id: "VACANT & BOARDED", name: "VACANT & BOARDED" },
  {
    id: "EITHER PARTY WAS GOVERNMENT AGENCY",
    name: "EITHER PARTY WAS GOVERNMENT AGENCY",
  },
  { id: "BLDG. REHABBED PRIOR TO SALE", name: "BLDG. REHABBED PRIOR TO SALE" },
  {
    id: "SALE INCLUDED BUSINESS - INVALID",
    name: "SALE INCLUDED BUSINESS - INVALID",
  },
  { id: "INTER-CORPORATION SALE", name: "INTER-CORPORATION SALE" },
  { id: "SHELL VALUE - VALID", name: "SHELL VALUE - VALID" },
  { id: "PARKING LOT/GARAGE SPACE", name: "PARKING LOT/GARAGE SPACE" },
  {
    id: "EITHER PARTY EXEMPT - INVALID",
    name: "EITHER PARTY EXEMPT - INVALID",
  },
  {
    id: "CONDO WITHOUT GARAGE/PARKING SPACE",
    name: "CONDO WITHOUT GARAGE/PARKING SPACE",
  },
  { id: "UNVERIFIED", name: "UNVERIFIED" },
  { id: "HOUSE WITH VACANT LOT", name: "HOUSE WITH VACANT LOT" },
  { id: "REDEVELOPMENT/ABATED - VALID", name: "REDEVELOPMENT/ABATED - VALID" },
  {
    id: "SALE INCLUDED BUSINESS - VALID",
    name: "SALE INCLUDED BUSINESS - VALID",
  },
  {
    id: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/ADJUSTED - VALID",
    name: "PRICE INCLUDES ACQUISITIONS & DEMOLITIONS/ADJUSTED - VALID",
  },
  { id: "MULTI-PARCEL SALE - VALID", name: "MULTI-PARCEL SALE - VALID" },
  { id: "EITHER PARTY EXEMPT - VALID", name: "EITHER PARTY EXEMPT - VALID" },
  {
    id: "VACANT LAND, OPEN MARKET, ARMS LENGTH",
    name: "VACANT LAND, OPEN MARKET, ARMS LENGTH",
  },
  {
    id: "MULTIPLE AND ADJACENT PARCELS",
    name: "MULTIPLE AND ADJACENT PARCELS",
  },
  { id: "INVESTOR", name: "INVESTOR" },
  { id: "ZERO $ OR $1 RECORDED", name: "ZERO $ OR $1 RECORDED" },
  {
    id: "CONDO WITH GARAGE/PARKING SPACE",
    name: "CONDO WITH GARAGE/PARKING SPACE",
  },
  { id: "SALE AFTER FORECLOSURE", name: "SALE AFTER FORECLOSURE" },
  { id: "MISCELLANEOUS", name: "MISCELLANEOUS" },
  { id: "LRA VACANT LAND", name: "LRA VACANT LAND" },
  { id: "NEVER ON OPEN MARKET", name: "NEVER ON OPEN MARKET" },
  { id: "VACANT & VANDALIZED - VALID", name: "VACANT & VANDALIZED - VALID" },
  { id: "MULTI-PARCEL SALE - INVALID", name: "MULTI-PARCEL SALE - INVALID" },
  { id: "GIFT", name: "GIFT" },
  {
    id: "REDEVELOPMENT/ABATED - INVALID",
    name: "REDEVELOPMENT/ABATED - INVALID",
  },
  { id: "SHERIFF'S SALE", name: "SHERIFF'S SALE" },
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

const LIMIT_OPTIONS = [
  { id: "10", label: "10" },
  { id: "25", label: "25" },
  { id: "50", label: "50" },
  { id: "100", label: "100" },
  { id: "500", label: "500" },
] as const;

type CdaNeighborhoodsResponse = {
  data: {
    source_id: number | null;
    name: string | null;
  }[];
};

type WardsResponse = {
  data: {
    id: number | null;
    name: string | null;
    geom: unknown;
  }[];
};

type AssessorNeighborhoodsResponse = {
  data: {
    id: number | null;
    name: string | null;
    geom: unknown;
  }[];
};

export default function SearchControls({
  salesData,
  isLoading = false,
}: SearchControlsProps) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  // URL params (persisted state)
  const currentMapStyle = searchParams.get("map_style") || "osm";
  const showBoundaries = searchParams.get("show_boundaries") || "none";
  const geometryView =
    (searchParams.get("geometry_view") as
      | "centroids"
      | "parcels"
      | "heatmap") || "centroids";
  const sortColumn = searchParams.get("sort") || "sale_date";
  const sortAsc = searchParams.get("sort_asc") || "false";
  const limit = searchParams.get("limit") || "50";

  // Parse array params from URL (memoized to prevent dependency changes)
  const urlMinPrice = useMemo(
    () => searchParams.get("min_price") || "",
    [searchParams],
  );
  const urlMaxPrice = useMemo(
    () => searchParams.get("max_price") || "",
    [searchParams],
  );
  const urlMinDate = useMemo(
    () => searchParams.get("min_date") || "",
    [searchParams],
  );
  const urlMaxDate = useMemo(
    () => searchParams.get("max_date") || "",
    [searchParams],
  );
  const urlConditions = useMemo(
    () => searchParams.get("conditions")?.split("|").filter(Boolean) || [],
    [searchParams],
  );
  const urlOccupancies = useMemo(
    () =>
      searchParams.get("occupancies")?.split("|").filter(Boolean).map(Number) ||
      [],
    [searchParams],
  );
  const urlWards = useMemo(
    () => searchParams.get("wards")?.split("|").filter(Boolean) || [],
    [searchParams],
  );
  const urlCdaNeighborhoods = useMemo(
    () =>
      searchParams
        .get("cda_neighborhoods")
        ?.split("|")
        .filter(Boolean)
        .map(Number) || [],
    [searchParams],
  );
  const urlAssessorNeighborhoods = useMemo(
    () =>
      searchParams.get("assessor_neighborhoods")?.split("|").filter(Boolean) ||
      [],
    [searchParams],
  );
  const urlSaleTypes = useMemo(
    () => searchParams.get("sale_types")?.split("|").filter(Boolean) || [],
    [searchParams],
  );

  // Local state (current control values)
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [minDate, setMinDate] = useState(urlMinDate);
  const [maxDate, setMaxDate] = useState(urlMaxDate);
  const [conditions, setConditions] = useState<string[]>(urlConditions);
  const [occupancies, setOccupancies] = useState<number[]>(urlOccupancies);
  const [wards, setWards] = useState<string[]>(urlWards);
  const [cdaNeighborhoods, setCdaNeighborhoods] =
    useState<number[]>(urlCdaNeighborhoods);
  const [assessorNeighborhoods, setAssessorNeighborhoods] = useState<string[]>(
    urlAssessorNeighborhoods,
  );
  const [saleTypes, setSaleTypes] = useState<string[]>(urlSaleTypes);

  // Detect if there are unsaved changes
  const hasChanges = useMemo(() => {
    return (
      minPrice !== urlMinPrice ||
      maxPrice !== urlMaxPrice ||
      minDate !== urlMinDate ||
      maxDate !== urlMaxDate ||
      conditions.join(",") !== urlConditions.join(",") ||
      occupancies.join(",") !== urlOccupancies.join(",") ||
      wards.join(",") !== urlWards.join(",") ||
      cdaNeighborhoods.join(",") !== urlCdaNeighborhoods.join(",") ||
      assessorNeighborhoods.join(",") !== urlAssessorNeighborhoods.join(",") ||
      saleTypes.join(",") !== urlSaleTypes.join(",")
    );
  }, [
    minPrice,
    maxPrice,
    minDate,
    maxDate,
    conditions,
    occupancies,
    wards,
    cdaNeighborhoods,
    assessorNeighborhoods,
    saleTypes,
    urlMinPrice,
    urlMaxPrice,
    urlMinDate,
    urlMaxDate,
    urlConditions,
    urlOccupancies,
    urlWards,
    urlCdaNeighborhoods,
    urlAssessorNeighborhoods,
    urlSaleTypes,
  ]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    // Set scalar filters
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    if (minDate) params.set("min_date", minDate);
    else params.delete("min_date");
    if (maxDate) params.set("max_date", maxDate);
    else params.delete("max_date");

    // Set array filters
    if (conditions.length > 0) params.set("conditions", conditions.join("|"));
    else params.delete("conditions");
    if (occupancies.length > 0)
      params.set("occupancies", occupancies.join("|"));
    else params.delete("occupancies");
    if (wards.length > 0) params.set("wards", wards.join("|"));
    else params.delete("wards");
    if (cdaNeighborhoods.length > 0)
      params.set("cda_neighborhoods", cdaNeighborhoods.join("|"));
    else params.delete("cda_neighborhoods");
    if (assessorNeighborhoods.length > 0)
      params.set("assessor_neighborhoods", assessorNeighborhoods.join("|"));
    else params.delete("assessor_neighborhoods");
    if (saleTypes.length > 0) params.set("sale_types", saleTypes.join("|"));
    else params.delete("sale_types");

    push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinDate("");
    setMaxDate("");
    setConditions([]);
    setOccupancies([]);
    setWards([]);
    setCdaNeighborhoods([]);
    setAssessorNeighborhoods([]);
    setSaleTypes([]);

    const params = new URLSearchParams(searchParams);
    params.delete("min_price");
    params.delete("max_price");
    params.delete("min_date");
    params.delete("max_date");
    params.delete("conditions");
    params.delete("occupancies");
    params.delete("wards");
    params.delete("cda_neighborhoods");
    params.delete("assessor_neighborhoods");
    params.delete("sale_types");

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

  const handleMapStyleChange = (mapStyle: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("map_style", mapStyle);
    push(`${pathname}?${params.toString()}`);
  };

  const handleBoundariesChange = (boundaries: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("show_boundaries", boundaries);
    push(`${pathname}?${params.toString()}`);
  };

  const handleSortColumnChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    push(`${pathname}?${params.toString()}`);
  };

  const handleSortDirectionChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_asc", value);
    push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", value);
    push(`${pathname}?${params.toString()}`);
  };

  const handleGeometryViewChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("geometry_view", value);
    push(`${pathname}?${params.toString()}`);
  };

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

        {/* Result Limit */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">Result Limit</Label>
          <Select value={limit} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose limit" />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
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

        {/* Geometry View */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold block">View</Label>
          <Select value={geometryView} onValueChange={handleGeometryViewChange}>
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Choose view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="centroids">Centroids</SelectItem>
              <SelectItem value="parcels">Parcel Geometries</SelectItem>
              <SelectItem value="heatmap">Heat Map</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t">
          <Label className="text-sm font-semibold block mb-4">Filters</Label>

          {/* Price Range */}
          <div className="space-y-2 mb-4">
            <Label className="text-sm font-semibold block">Price Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2 mb-4">
            <Label className="text-sm font-semibold block">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={minDate}
                onChange={(e) => setMinDate(e.target.value)}
              />
              <Input
                type="date"
                value={maxDate}
                onChange={(e) => setMaxDate(e.target.value)}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-3 mb-4">
            <ComboboxGeneric<
              (typeof CONDITION_OPTIONS)[number],
              (typeof CONDITION_OPTIONS)[number]["id"]
            >
              items={CONDITION_OPTIONS}
              value={conditions as (typeof CONDITION_OPTIONS)[number]["id"][]}
              onValueChange={setConditions}
              itemToValue={(item) => item.id}
              itemToLabel={(item) => item.name}
              label="Condition"
              placeholder="Select conditions..."
              isLoading={isLoading}
            />
          </div>

          {/* Occupancies */}
          <div className="space-y-3 mb-4">
            <ComboboxGeneric<
              (typeof OCCUPANCY_OPTIONS)[number],
              (typeof OCCUPANCY_OPTIONS)[number]["id"]
            >
              items={OCCUPANCY_OPTIONS}
              value={occupancies as (typeof OCCUPANCY_OPTIONS)[number]["id"][]}
              onValueChange={setOccupancies}
              itemToValue={(item) => item.id}
              itemToLabel={(item) => item.name}
              label="Occupancy Type"
              placeholder="Select occupancy types..."
              isLoading={isLoading}
            />
          </div>

          {/* Sale Types */}
          <div className="space-y-3 mb-4">
            <ComboboxGeneric<
              (typeof SALE_TYPE_OPTIONS)[number],
              (typeof SALE_TYPE_OPTIONS)[number]["id"]
            >
              items={SALE_TYPE_OPTIONS}
              value={saleTypes as (typeof SALE_TYPE_OPTIONS)[number]["id"][]}
              onValueChange={setSaleTypes}
              itemToValue={(item) => item.id}
              itemToLabel={(item) => item.name}
              label="Sale Type"
              placeholder="Select sale types..."
              isLoading={isLoading}
            />
          </div>

          {/* Wards */}
          <div className="space-y-3 mb-4">
            <ComboboxGenericSWR<
              WardsResponse,
              { id: number; name: string; geom: unknown },
              string
            >
              apiRoute="/api/wards"
              transformData={(response) =>
                response.data
                  .filter(
                    (
                      item,
                    ): item is { id: number; name: string; geom: unknown } =>
                      item.id !== null && item.name !== null,
                  )
                  .map((item) => ({
                    id: item.id,
                    name: item.name,
                    geom: item.geom,
                  }))
              }
              value={wards}
              onValueChange={setWards}
              itemToValue={(item) => item.name}
              itemToLabel={(item) => item.name}
              sortItems={(items) =>
                [...items].sort((a, b) => a.name.localeCompare(b.name))
              }
              label="Wards"
              placeholder="Select wards..."
            />
          </div>

          {/* CDA Neighborhoods */}
          <div className="space-y-3 mb-4">
            <ComboboxGenericSWR<
              CdaNeighborhoodsResponse,
              { source_id: number; name: string },
              number
            >
              apiRoute="/api/cda-neighborhoods"
              transformData={(response) =>
                response.data
                  .filter(
                    (item): item is { source_id: number; name: string } =>
                      item.source_id !== null && item.name !== null,
                  )
                  .map((item) => ({
                    source_id: item.source_id,
                    name: item.name,
                  }))
              }
              value={cdaNeighborhoods}
              onValueChange={setCdaNeighborhoods}
              itemToValue={(item) => item.source_id}
              itemToLabel={(item) => `${item.name}`}
              sortItems={(items) =>
                [...items].sort((a, b) => a.name.localeCompare(b.name))
              }
              label="CDA Neighborhoods"
              placeholder="Select CDA neighborhoods..."
            />
          </div>

          {/* Assessor Neighborhoods */}
          <div className="space-y-3 mb-4">
            <ComboboxGenericSWR<
              AssessorNeighborhoodsResponse,
              { id: number; name: string; geom: unknown },
              string
            >
              apiRoute="/api/assessor-neighborhoods"
              transformData={(response) =>
                response.data
                  .filter(
                    (
                      item,
                    ): item is { id: number; name: string; geom: unknown } =>
                      item.id !== null && item.name !== null,
                  )
                  .map((item) => ({
                    id: item.id,
                    name: item.name,
                    geom: item.geom,
                  }))
              }
              value={assessorNeighborhoods}
              onValueChange={setAssessorNeighborhoods}
              itemToValue={(item) => item.name}
              itemToLabel={(item) => item.name}
              sortItems={(items) =>
                [...items].sort((a, b) => a.name.localeCompare(b.name))
              }
              label="Assessor Neighborhoods"
              placeholder="Select assessor neighborhoods..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={applyFilters}
              disabled={!hasChanges}
              variant={hasChanges ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              Apply Filters{hasChanges && " *"}
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
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
