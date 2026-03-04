"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    source_id: string | null;
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

type FilterParamName =
  | "min_price"
  | "max_price"
  | "min_date"
  | "max_date"
  | "conditions"
  | "occupancies"
  | "wards"
  | "cda_neighborhoods"
  | "assessor_neighborhoods"
  | "sale_types";

type ActiveFilterChip = {
  key: string;
  label: string;
  paramName: FilterParamName;
  value?: string;
};

const OCCUPANCY_NAME_BY_ID = new Map(
  OCCUPANCY_OPTIONS.map((option) => [String(option.id), option.name]),
);

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

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

  const currentMapStyleLabel =
    MAP_STYLE_OPTIONS.find((option) => option.id === currentMapStyle)?.label ||
    "OpenStreetMap";
  const currentBoundaryLabel =
    BOUNDARY_OPTIONS.find((option) => option.id === showBoundaries)?.label ||
    "None";
  const currentGeometryViewLabel =
    geometryView === "centroids"
      ? "Centroids"
      : geometryView === "parcels"
        ? "Parcel Geometries"
        : "Heat Map";

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
      searchParams.get("cda_neighborhoods")?.split("|").filter(Boolean) || [],
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
    useState<string[]>(urlCdaNeighborhoods);
  const [assessorNeighborhoods, setAssessorNeighborhoods] = useState<string[]>(
    urlAssessorNeighborhoods,
  );
  const [saleTypes, setSaleTypes] = useState<string[]>(urlSaleTypes);

  const [applyingFilters, setApplyingFilters] = useState(false);

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (urlMinPrice)
      chips.push({
        key: `min_price-${urlMinPrice}`,
        label: `Min Price: ${formatCurrency(Number(urlMinPrice))}`,
        paramName: "min_price",
      });
    if (urlMaxPrice)
      chips.push({
        key: `max_price-${urlMaxPrice}`,
        label: `Max Price: ${formatCurrency(Number(urlMaxPrice))}`,
        paramName: "max_price",
      });
    if (urlMinDate)
      chips.push({
        key: `min_date-${urlMinDate}`,
        label: `From: ${urlMinDate}`,
        paramName: "min_date",
      });
    if (urlMaxDate)
      chips.push({
        key: `max_date-${urlMaxDate}`,
        label: `To: ${urlMaxDate}`,
        paramName: "max_date",
      });

    urlConditions.forEach((value) => {
      chips.push({
        key: `conditions-${value}`,
        label: `Condition: ${value}`,
        paramName: "conditions",
        value,
      });
    });

    urlOccupancies.forEach((value) => {
      const valueString = String(value);
      chips.push({
        key: `occupancies-${valueString}`,
        label: `Occupancy: ${OCCUPANCY_NAME_BY_ID.get(valueString) ?? valueString}`,
        paramName: "occupancies",
        value: valueString,
      });
    });

    urlWards.forEach((value) => {
      chips.push({
        key: `wards-${value}`,
        label: `Ward: ${value}`,
        paramName: "wards",
        value,
      });
    });

    urlCdaNeighborhoods.forEach((value) => {
      chips.push({
        key: `cda_neighborhoods-${value}`,
        label: `CDA: ${value}`,
        paramName: "cda_neighborhoods",
        value,
      });
    });

    urlAssessorNeighborhoods.forEach((value) => {
      chips.push({
        key: `assessor_neighborhoods-${value}`,
        label: `Assessor: ${value}`,
        paramName: "assessor_neighborhoods",
        value,
      });
    });

    urlSaleTypes.forEach((value) => {
      chips.push({
        key: `sale_types-${value}`,
        label: `Sale Type: ${value}`,
        paramName: "sale_types",
        value,
      });
    });

    return chips;
  }, [
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
    setApplyingFilters(true);
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
    setApplyingFilters(false);
  };

  const clearFilters = () => {
    setApplyingFilters(true);
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
    setApplyingFilters(false);
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

  const resetPendingFilters = () => {
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setMinDate(urlMinDate);
    setMaxDate(urlMaxDate);
    setConditions(urlConditions);
    setOccupancies(urlOccupancies);
    setWards(urlWards);
    setCdaNeighborhoods(urlCdaNeighborhoods);
    setAssessorNeighborhoods(urlAssessorNeighborhoods);
    setSaleTypes(urlSaleTypes);
  };

  const handleFiltersFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasChanges && !applyingFilters) {
      applyFilters();
    }
  };

  const handleRemoveActiveFilter = (
    paramName: FilterParamName,
    value?: string,
  ) => {
    const params = new URLSearchParams(searchParams);

    if (
      paramName === "min_price" ||
      paramName === "max_price" ||
      paramName === "min_date" ||
      paramName === "max_date"
    ) {
      params.delete(paramName);

      if (paramName === "min_price") setMinPrice("");
      if (paramName === "max_price") setMaxPrice("");
      if (paramName === "min_date") setMinDate("");
      if (paramName === "max_date") setMaxDate("");
    } else {
      const currentValues =
        params
          .get(paramName)
          ?.split("|")
          .filter(Boolean)
          .filter((v) => v !== value) ?? [];

      if (currentValues.length > 0) {
        params.set(paramName, currentValues.join("|"));
      } else {
        params.delete(paramName);
      }

      if (paramName === "conditions") setConditions(currentValues);
      if (paramName === "occupancies")
        setOccupancies(
          currentValues.map((v) => Number(v)).filter(Number.isFinite),
        );
      if (paramName === "wards") setWards(currentValues);
      if (paramName === "cda_neighborhoods") setCdaNeighborhoods(currentValues);
      if (paramName === "assessor_neighborhoods")
        setAssessorNeighborhoods(currentValues);
      if (paramName === "sale_types") setSaleTypes(currentValues);
    }

    push(`${pathname}?${params.toString()}`);
  };

  // Keyboard shortcuts for cycling through options
  useEffect(() => {
    const cycleParam = (
      paramName: string,
      options: readonly { id: string }[],
      currentValue: string,
    ) => {
      const currentIndex = options.findIndex(
        (option) => option.id === currentValue,
      );
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
      const params = new URLSearchParams(searchParams);
      params.set(paramName, options[nextIndex].id);
      push(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        !!target?.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select";

      if (isTypingTarget) return;
      if (!event.ctrlKey || !event.shiftKey || event.metaKey || event.altKey)
        return;

      const key = event.key.toLowerCase();

      if (key === "m") {
        event.preventDefault();
        cycleParam("map_style", MAP_STYLE_OPTIONS, currentMapStyle);
      } else if (key === "b") {
        event.preventDefault();
        cycleParam("show_boundaries", BOUNDARY_OPTIONS, showBoundaries);
      } else if (key === "v") {
        event.preventDefault();
        cycleParam(
          "geometry_view",
          [{ id: "centroids" }, { id: "parcels" }, { id: "heatmap" }],
          geometryView,
        );
      } else if (key === "s") {
        event.preventDefault();
        cycleParam("sort", SORT_COLUMN_OPTIONS, sortColumn);
      } else if (key === "d") {
        event.preventDefault();
        cycleParam("sort_asc", SORT_DIRECTION_OPTIONS, sortAsc);
      } else if (key === "l") {
        event.preventDefault();
        cycleParam("limit", LIMIT_OPTIONS, limit);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentMapStyle,
    showBoundaries,
    geometryView,
    sortColumn,
    sortAsc,
    limit,
    searchParams,
    pathname,
    push,
  ]);

  return (
    <>
      {hasChanges && (
        <div className="fixed inset-x-0 top-3 z-[950] px-4">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-lg border bg-background p-3 shadow-lg">
            <div className="text-sm text-foreground">
              Unsaved filter changes
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                form="sales-search-filters-form"
                size="sm"
                disabled={applyingFilters}
              >
                {applyingFilters ? "Applying..." : "Apply"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetPendingFilters}
                disabled={applyingFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      <form
        id="sales-search-filters-form"
        onSubmit={handleFiltersFormSubmit}
        className="space-y-0"
      >
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
              <Label className="text-sm font-semibold block">
                Sort Direction
              </Label>
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
              <Label className="text-sm font-semibold block">
                Result Limit
              </Label>
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

            <div className="space-y-2">
              <Label className="text-sm font-semibold block">
                Map Settings
              </Label>
              <Dialog>
                <div className="flex items-center justify-between gap-2 rounded-md border p-3">
                  <div className="min-w-0 text-xs text-muted-foreground">
                    <div className="truncate">
                      Style: {currentMapStyleLabel}
                    </div>
                    <div className="truncate">
                      Boundaries: {currentBoundaryLabel}
                    </div>
                    <div className="truncate">
                      View: {currentGeometryViewLabel}
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </DialogTrigger>
                </div>

                <DialogContent className="z-[1000]">
                  <DialogHeader>
                    <DialogTitle>Map Settings</DialogTitle>
                    <DialogDescription>
                      Update map style, boundary layer, and geometry view.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold block">
                        Map Style
                      </Label>
                      <Select
                        value={currentMapStyle}
                        onValueChange={handleMapStyleChange}
                      >
                        <SelectTrigger className="w-full" size="sm">
                          <SelectValue placeholder="Choose a map style" />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          {MAP_STYLE_OPTIONS.map((style) => (
                            <SelectItem key={style.id} value={style.id}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold block">
                        Show Boundaries
                      </Label>
                      <Select
                        value={showBoundaries}
                        onValueChange={handleBoundariesChange}
                      >
                        <SelectTrigger className="w-full" size="sm">
                          <SelectValue placeholder="Choose boundaries" />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          {BOUNDARY_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold block">
                        View
                      </Label>
                      <Select
                        value={geometryView}
                        onValueChange={handleGeometryViewChange}
                      >
                        <SelectTrigger className="w-full" size="sm">
                          <SelectValue placeholder="Choose view" />
                        </SelectTrigger>
                        <SelectContent className="z-[1001]">
                          <SelectItem value="centroids">Centroids</SelectItem>
                          <SelectItem value="parcels">
                            Parcel Geometries
                          </SelectItem>
                          <SelectItem value="heatmap">Heat Map</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="pt-4 border-t">
              <Label className="text-sm font-semibold block mb-4">
                Filters
              </Label>

              {activeFilterChips.length > 0 && (
                <div className="mb-4">
                  <Label className="text-xs font-medium text-muted-foreground block mb-2">
                    Active Filters
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {activeFilterChips.map((chip) => (
                      <Badge
                        key={chip.key}
                        variant="secondary"
                        className="gap-2 py-1 pr-1"
                      >
                        <span
                          className="max-w-[220px] truncate"
                          title={chip.label}
                        >
                          {chip.label}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1 text-xs"
                          onClick={() =>
                            handleRemoveActiveFilter(chip.paramName, chip.value)
                          }
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold block">
                  Price Range
                </Label>
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
                <Label className="text-sm font-semibold block">
                  Date Range
                </Label>
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
                  value={
                    conditions as (typeof CONDITION_OPTIONS)[number]["id"][]
                  }
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
                  value={
                    occupancies as (typeof OCCUPANCY_OPTIONS)[number]["id"][]
                  }
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
                  value={
                    saleTypes as (typeof SALE_TYPE_OPTIONS)[number]["id"][]
                  }
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
                        ): item is {
                          id: number;
                          name: string;
                          geom: unknown;
                        } => item.id !== null && item.name !== null,
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
                  { source_id: string; name: string },
                  string
                >
                  apiRoute="/api/cda-neighborhoods"
                  transformData={(response) =>
                    response.data
                      .filter(
                        (item): item is { source_id: string; name: string } =>
                          item.source_id !== null && item.name !== null,
                      )
                      .map((item) => ({
                        source_id: String(item.source_id),
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
                        ): item is {
                          id: number;
                          name: string;
                          geom: unknown;
                        } => item.id !== null && item.name !== null,
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
                  type="submit"
                  disabled={!hasChanges || applyingFilters}
                  variant={hasChanges ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  {applyingFilters
                    ? "Applying..."
                    : hasChanges
                      ? "Apply Filters"
                      : "Filters Applied"}
                </Button>
                <Button
                  type="button"
                  onClick={clearFilters}
                  disabled={applyingFilters}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {applyingFilters ? "Clearing..." : "Clear Filters"}
                </Button>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-semibold block">Summary</Label>
              <div className="text-xs text-muted-foreground">
                Shortcuts: Ctrl+Shift+M (Map), B (Boundaries), V (View), S
                (Sort), D (Direction), L (Limit)
              </div>
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
      </form>
    </>
  );
}
