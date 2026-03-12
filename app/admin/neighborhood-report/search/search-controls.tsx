"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import type { MapStyle } from "@/lib/map-utils";
import type { NeighborhoodReportRow } from "./types";
import NEIGHBORHOOD_OPTIONS from "./neighborhood-options.json";

interface SearchControlsProps {
  rows: NeighborhoodReportRow[];
  isLoading?: boolean;
}

const OCCUPANCY_OPTIONS = [
  { id: 1110, name: "Single Family" },
  { id: 1120, name: "Two Family" },
  { id: 1130, name: "Three Family" },
  { id: 1140, name: "Four Family" },
  { id: 1185, name: "Apartments" },
] as const;

const COST_GROUP_OPTIONS = [
  { id: "1", name: "Frame (1)" },
  { id: "3", name: "Frame (3)" },
  { id: "7", name: "Brick (7)" },
  { id: "9", name: "Stone (9)" },
] as const;

const CDU_OPTIONS = [
  { id: "Unsound", name: "Unsound" },
  { id: "Poor", name: "Poor" },
  { id: "Fair", name: "Fair" },
  { id: "Average", name: "Average" },
  { id: "Good", name: "Good" },
  { id: "Very Good", name: "Very Good" },
  { id: "Excellent", name: "Excellent" },
] as const;

const GRADE_OPTIONS = [
  { id: "A", name: "A" },
  { id: "AA", name: "AA" },
  { id: "Average", name: "Average" },
  { id: "B", name: "B" },
  { id: "C", name: "C" },
  { id: "D", name: "D" },
  { id: "E", name: "E" },
  { id: "High", name: "High" },
] as const;

const MAP_STYLE_OPTIONS: { id: MapStyle; label: string }[] = [
  { id: "osm", label: "OpenStreetMap" },
  { id: "osm-hot", label: "OpenStreetMap HOT" },
  { id: "carto-light", label: "CARTO Light" },
  { id: "carto-dark", label: "CARTO Dark" },
  { id: "stadia-light", label: "Stadia Light" },
  { id: "stadia-dark", label: "Stadia Dark" },
  { id: "esri-worldimagery", label: "ESRI Satellite" },
  { id: "esri-topomap", label: "ESRI Topographic" },
];

const BOUNDARY_OPTIONS = [
  { id: "none", label: "None" },
  { id: "wards", label: "Wards" },
  { id: "cda_neighborhoods", label: "CDA Neighborhoods" },
  { id: "assessor_neighborhoods", label: "Assessor Neighborhoods" },
] as const;

const SORT_COLUMN_OPTIONS = [
  { id: "report_timestamp", label: "Report Timestamp" },
  { id: "year", label: "Year" },
  { id: "year_built", label: "Year Built" },
  { id: "total_area", label: "Total Area" },
  { id: "gla", label: "GLA" },
  { id: "story", label: "Story" },
  { id: "total", label: "Total" },
  { id: "neighborhood", label: "Neighborhood" },
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

const YEAR_OPTIONS = [
  { id: "2020", label: "2020" },
  { id: "2021", label: "2021" },
  { id: "2022", label: "2022" },
  { id: "2023", label: "2023" },
  { id: "2024", label: "2024" },
  { id: "2025", label: "2025" },
  { id: "2026", label: "2026" },
] as const;

type ArrayParamName =
  | "neighborhoods"
  | "occupancies"
  | "cost_groups"
  | "cdus"
  | "grades";

type YearParamName = "year";

type ScalarParamName =
  | "min_year_built"
  | "max_year_built"
  | "min_total_area"
  | "max_total_area"
  | "min_gla"
  | "max_gla"
  | "min_story"
  | "max_story"
  | "min_total"
  | "max_total";

type Chip = {
  key: string;
  label: string;
  param: ArrayParamName | ScalarParamName | YearParamName;
  value?: string;
};

function parseStringArray(searchParams: URLSearchParams, key: ArrayParamName) {
  return searchParams.get(key)?.split("|").filter(Boolean) || [];
}

function parseNumberArray(searchParams: URLSearchParams, key: ArrayParamName) {
  return (
    searchParams
      .get(key)
      ?.split("|")
      .filter(Boolean)
      .map((value) => Number(value)) || []
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function SearchControls({
  rows,
  isLoading = false,
}: SearchControlsProps) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  const [neighborhoods, setNeighborhoods] = useState<string[]>(
    parseStringArray(searchParams, "neighborhoods"),
  );
  const [year, setYear] = useState(searchParams.get("year") || "2026");
  const [occupancies, setOccupancies] = useState<number[]>(
    parseNumberArray(searchParams, "occupancies"),
  );
  const [costGroups, setCostGroups] = useState<string[]>(
    parseStringArray(searchParams, "cost_groups"),
  );
  const [cdus, setCdus] = useState<string[]>(
    parseStringArray(searchParams, "cdus"),
  );
  const [grades, setGrades] = useState<string[]>(
    parseStringArray(searchParams, "grades"),
  );

  const [minYearBuilt, setMinYearBuilt] = useState(
    searchParams.get("min_year_built") || "",
  );
  const [maxYearBuilt, setMaxYearBuilt] = useState(
    searchParams.get("max_year_built") || "",
  );
  const [minTotalArea, setMinTotalArea] = useState(
    searchParams.get("min_total_area") || "",
  );
  const [maxTotalArea, setMaxTotalArea] = useState(
    searchParams.get("max_total_area") || "",
  );
  const [minGla, setMinGla] = useState(searchParams.get("min_gla") || "");
  const [maxGla, setMaxGla] = useState(searchParams.get("max_gla") || "");
  const [minStory, setMinStory] = useState(searchParams.get("min_story") || "");
  const [maxStory, setMaxStory] = useState(searchParams.get("max_story") || "");
  const [minTotal, setMinTotal] = useState(searchParams.get("min_total") || "");
  const [maxTotal, setMaxTotal] = useState(searchParams.get("max_total") || "");
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [unsavedBannerDismissed, setUnsavedBannerDismissed] = useState(false);

  useEffect(() => {
    setYear(searchParams.get("year") || "2026");
    setNeighborhoods(parseStringArray(searchParams, "neighborhoods"));
    setOccupancies(parseNumberArray(searchParams, "occupancies"));
    setCostGroups(parseStringArray(searchParams, "cost_groups"));
    setCdus(parseStringArray(searchParams, "cdus"));
    setGrades(parseStringArray(searchParams, "grades"));
    setMinYearBuilt(searchParams.get("min_year_built") || "");
    setMaxYearBuilt(searchParams.get("max_year_built") || "");
    setMinTotalArea(searchParams.get("min_total_area") || "");
    setMaxTotalArea(searchParams.get("max_total_area") || "");
    setMinGla(searchParams.get("min_gla") || "");
    setMaxGla(searchParams.get("max_gla") || "");
    setMinStory(searchParams.get("min_story") || "");
    setMaxStory(searchParams.get("max_story") || "");
    setMinTotal(searchParams.get("min_total") || "");
    setMaxTotal(searchParams.get("max_total") || "");
  }, [searchParams]);

  const urlNeighborhoods = useMemo(
    () => parseStringArray(searchParams, "neighborhoods"),
    [searchParams],
  );
  const urlYear = useMemo(
    () => searchParams.get("year") || "2026",
    [searchParams],
  );
  const urlOccupancies = useMemo(
    () => parseNumberArray(searchParams, "occupancies"),
    [searchParams],
  );
  const urlCostGroups = useMemo(
    () => parseStringArray(searchParams, "cost_groups"),
    [searchParams],
  );
  const urlCdus = useMemo(
    () => parseStringArray(searchParams, "cdus"),
    [searchParams],
  );
  const urlGrades = useMemo(
    () => parseStringArray(searchParams, "grades"),
    [searchParams],
  );
  const urlMinYearBuilt = useMemo(
    () => searchParams.get("min_year_built") || "",
    [searchParams],
  );
  const urlMaxYearBuilt = useMemo(
    () => searchParams.get("max_year_built") || "",
    [searchParams],
  );
  const urlMinTotalArea = useMemo(
    () => searchParams.get("min_total_area") || "",
    [searchParams],
  );
  const urlMaxTotalArea = useMemo(
    () => searchParams.get("max_total_area") || "",
    [searchParams],
  );
  const urlMinGla = useMemo(
    () => searchParams.get("min_gla") || "",
    [searchParams],
  );
  const urlMaxGla = useMemo(
    () => searchParams.get("max_gla") || "",
    [searchParams],
  );
  const urlMinStory = useMemo(
    () => searchParams.get("min_story") || "",
    [searchParams],
  );
  const urlMaxStory = useMemo(
    () => searchParams.get("max_story") || "",
    [searchParams],
  );
  const urlMinTotal = useMemo(
    () => searchParams.get("min_total") || "",
    [searchParams],
  );
  const urlMaxTotal = useMemo(
    () => searchParams.get("max_total") || "",
    [searchParams],
  );

  const activeFilterChips = useMemo<Chip[]>(() => {
    const chips: Chip[] = [];

    chips.push({
      key: `year-${year}`,
      label: `Year: ${year}`,
      param: "year",
      value: year,
    });

    neighborhoods.forEach((value) => {
      chips.push({
        key: `neighborhood-${value}`,
        label: `Neighborhood: ${value}`,
        param: "neighborhoods",
        value,
      });
    });
    occupancies.forEach((value) => {
      chips.push({
        key: `occupancy-${value}`,
        label: `Occupancy: ${value}`,
        param: "occupancies",
        value: String(value),
      });
    });
    costGroups.forEach((value) => {
      chips.push({
        key: `cost-group-${value}`,
        label: `Cost Group: ${value}`,
        param: "cost_groups",
        value,
      });
    });
    cdus.forEach((value) => {
      chips.push({
        key: `cdu-${value}`,
        label: `CDU: ${value}`,
        param: "cdus",
        value,
      });
    });
    grades.forEach((value) => {
      chips.push({
        key: `grade-${value}`,
        label: `Grade: ${value}`,
        param: "grades",
        value,
      });
    });

    [
      ["min_year_built", minYearBuilt],
      ["max_year_built", maxYearBuilt],
      ["min_total_area", minTotalArea],
      ["max_total_area", maxTotalArea],
      ["min_gla", minGla],
      ["max_gla", maxGla],
      ["min_story", minStory],
      ["max_story", maxStory],
      ["min_total", minTotal],
      ["max_total", maxTotal],
    ].forEach(([param, value]) => {
      if (!value) return;
      chips.push({
        key: `${param}-${value}`,
        label: `${formatLabel(param)}: ${value}`,
        param: param as ScalarParamName,
      });
    });

    return chips;
  }, [
    year,
    neighborhoods,
    occupancies,
    costGroups,
    cdus,
    grades,
    minYearBuilt,
    maxYearBuilt,
    minTotalArea,
    maxTotalArea,
    minGla,
    maxGla,
    minStory,
    maxStory,
    minTotal,
    maxTotal,
  ]);

  const hasChanges = useMemo(
    () =>
      year !== urlYear ||
      neighborhoods.join("|") !== urlNeighborhoods.join("|") ||
      occupancies.join("|") !== urlOccupancies.join("|") ||
      costGroups.join("|") !== urlCostGroups.join("|") ||
      cdus.join("|") !== urlCdus.join("|") ||
      grades.join("|") !== urlGrades.join("|") ||
      minYearBuilt !== urlMinYearBuilt ||
      maxYearBuilt !== urlMaxYearBuilt ||
      minTotalArea !== urlMinTotalArea ||
      maxTotalArea !== urlMaxTotalArea ||
      minGla !== urlMinGla ||
      maxGla !== urlMaxGla ||
      minStory !== urlMinStory ||
      maxStory !== urlMaxStory ||
      minTotal !== urlMinTotal ||
      maxTotal !== urlMaxTotal,
    [
      year,
      urlYear,
      neighborhoods,
      urlNeighborhoods,
      occupancies,
      urlOccupancies,
      costGroups,
      urlCostGroups,
      cdus,
      urlCdus,
      grades,
      urlGrades,
      minYearBuilt,
      urlMinYearBuilt,
      maxYearBuilt,
      urlMaxYearBuilt,
      minTotalArea,
      urlMinTotalArea,
      maxTotalArea,
      urlMaxTotalArea,
      minGla,
      urlMinGla,
      maxGla,
      urlMaxGla,
      minStory,
      urlMinStory,
      maxStory,
      urlMaxStory,
      minTotal,
      urlMinTotal,
      maxTotal,
      urlMaxTotal,
    ],
  );

  const applyFilters = useCallback(() => {
    setApplyingFilters(true);
    const params = new URLSearchParams(searchParams.toString());

    const setArrayParam = (
      key: ArrayParamName,
      values: Array<string | number>,
    ) => {
      if (values.length > 0) {
        params.set(key, values.join("|"));
      } else {
        params.delete(key);
      }
    };

    const setScalarParam = (key: ScalarParamName, value: string) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };

    params.set("year", year || "2026");
    setArrayParam("neighborhoods", neighborhoods);
    setArrayParam("occupancies", occupancies);
    setArrayParam("cost_groups", costGroups);
    setArrayParam("cdus", cdus);
    setArrayParam("grades", grades);

    setScalarParam("min_year_built", minYearBuilt);
    setScalarParam("max_year_built", maxYearBuilt);
    setScalarParam("min_total_area", minTotalArea);
    setScalarParam("max_total_area", maxTotalArea);
    setScalarParam("min_gla", minGla);
    setScalarParam("max_gla", maxGla);
    setScalarParam("min_story", minStory);
    setScalarParam("max_story", maxStory);
    setScalarParam("min_total", minTotal);
    setScalarParam("max_total", maxTotal);

    if (!params.get("sort")) params.set("sort", "report_timestamp");
    if (!params.get("sort_asc")) params.set("sort_asc", "false");
    if (!params.get("limit")) params.set("limit", "50");
    if (!params.get("map_style")) params.set("map_style", "osm");

    push(`${pathname}?${params.toString()}`);
    setApplyingFilters(false);
  }, [
    searchParams,
    year,
    neighborhoods,
    occupancies,
    costGroups,
    cdus,
    grades,
    minYearBuilt,
    maxYearBuilt,
    minTotalArea,
    maxTotalArea,
    minGla,
    maxGla,
    minStory,
    maxStory,
    minTotal,
    maxTotal,
    push,
    pathname,
  ]);

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    [
      "neighborhoods",
      "occupancies",
      "cost_groups",
      "cdus",
      "grades",
      "min_year_built",
      "max_year_built",
      "min_total_area",
      "max_total_area",
      "min_gla",
      "max_gla",
      "min_story",
      "max_story",
      "min_total",
      "max_total",
    ].forEach((key) => params.delete(key));
    params.set("year", "2026");
    push(`${pathname}?${params.toString()}`);
  };

  const resetPendingFilters = useCallback(() => {
    setYear(urlYear);
    setNeighborhoods(urlNeighborhoods);
    setOccupancies(urlOccupancies);
    setCostGroups(urlCostGroups);
    setCdus(urlCdus);
    setGrades(urlGrades);
    setMinYearBuilt(urlMinYearBuilt);
    setMaxYearBuilt(urlMaxYearBuilt);
    setMinTotalArea(urlMinTotalArea);
    setMaxTotalArea(urlMaxTotalArea);
    setMinGla(urlMinGla);
    setMaxGla(urlMaxGla);
    setMinStory(urlMinStory);
    setMaxStory(urlMaxStory);
    setMinTotal(urlMinTotal);
    setMaxTotal(urlMaxTotal);
  }, [
    urlYear,
    urlNeighborhoods,
    urlOccupancies,
    urlCostGroups,
    urlCdus,
    urlGrades,
    urlMinYearBuilt,
    urlMaxYearBuilt,
    urlMinTotalArea,
    urlMaxTotalArea,
    urlMinGla,
    urlMaxGla,
    urlMinStory,
    urlMaxStory,
    urlMinTotal,
    urlMaxTotal,
  ]);

  const handleFiltersFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasChanges || applyingFilters) return;
    applyFilters();
  };

  useEffect(() => {
    if (!hasChanges) {
      setUnsavedBannerDismissed(false);
    }
  }, [hasChanges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        !!target?.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select";

      if (isTypingTarget || applyingFilters || !hasChanges) return;

      if (event.key === "Enter" && event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        applyFilters();
        return;
      }

      if (event.key.toLowerCase() === "r" && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        resetPendingFilters();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setUnsavedBannerDismissed(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, applyingFilters, applyFilters, resetPendingFilters]);

  const removeChip = (chip: Chip) => {
    if (chip.param === "year") {
      setYear("2026");
      return;
    }
    if (chip.param === "neighborhoods") {
      setNeighborhoods((prev) => prev.filter((value) => value !== chip.value));
      return;
    }
    if (chip.param === "occupancies") {
      setOccupancies((prev) =>
        prev.filter((value) => String(value) !== chip.value),
      );
      return;
    }
    if (chip.param === "cost_groups") {
      setCostGroups((prev) => prev.filter((value) => value !== chip.value));
      return;
    }
    if (chip.param === "cdus") {
      setCdus((prev) => prev.filter((value) => value !== chip.value));
      return;
    }
    if (chip.param === "grades") {
      setGrades((prev) => prev.filter((value) => value !== chip.value));
      return;
    }

    if (chip.param === "min_year_built") setMinYearBuilt("");
    if (chip.param === "max_year_built") setMaxYearBuilt("");
    if (chip.param === "min_total_area") setMinTotalArea("");
    if (chip.param === "max_total_area") setMaxTotalArea("");
    if (chip.param === "min_gla") setMinGla("");
    if (chip.param === "max_gla") setMaxGla("");
    if (chip.param === "min_story") setMinStory("");
    if (chip.param === "max_story") setMaxStory("");
    if (chip.param === "min_total") setMinTotal("");
    if (chip.param === "max_total") setMaxTotal("");
  };

  const currentMapStyle =
    (searchParams.get("map_style") as MapStyle | null) || "osm";
  const currentSort = searchParams.get("sort") || "report_timestamp";
  const currentSortAsc = searchParams.get("sort_asc") || "false";
  const currentLimit = searchParams.get("limit") || "50";
  const showBoundaries = searchParams.get("show_boundaries") || "none";
  const currentMapStyleLabel =
    MAP_STYLE_OPTIONS.find((option) => option.id === currentMapStyle)?.label ||
    "OpenStreetMap";
  const currentBoundaryLabel =
    BOUNDARY_OPTIONS.find((option) => option.id === showBoundaries)?.label ||
    "None";

  const updateSimpleParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    push(`${pathname}?${params.toString()}`);
  };

  const handleBoundariesChange = (boundaries: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("show_boundaries", boundaries);
    push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <form
        id="neighborhood-report-filters-form"
        onSubmit={handleFiltersFormSubmit}
      >
        <Card>
          <CardHeader>
            <CardTitle>Neighborhood Report Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasChanges && !unsavedBannerDismissed && (
              <div className="sticky top-2 z-20 rounded-lg border bg-background p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-foreground">
                    Unsaved filter changes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      form="neighborhood-report-filters-form"
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
                <div className="mt-2 text-xs text-muted-foreground">
                  Shortcuts: Ctrl+Enter (Apply), Ctrl+Shift+R (Reset), Esc
                  (Cancel)
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ComboboxGeneric
                items={NEIGHBORHOOD_OPTIONS}
                value={neighborhoods}
                onValueChange={setNeighborhoods}
                itemToValue={(item) => item.id}
                itemToLabel={(item) => item.name}
                label="Neighborhoods"
                placeholder="Select neighborhoods"
                autoHighlight
              />

              <ComboboxGeneric
                items={OCCUPANCY_OPTIONS}
                value={occupancies}
                onValueChange={setOccupancies}
                itemToValue={(item) => item.id}
                itemToLabel={(item) => item.name}
                label="Occupancies"
                placeholder="Select occupancies"
                autoHighlight
              />

              <ComboboxGeneric
                items={COST_GROUP_OPTIONS}
                value={costGroups}
                onValueChange={setCostGroups}
                itemToValue={(item) => item.id}
                itemToLabel={(item) => item.name}
                label="Cost Group"
                placeholder="Select cost groups"
                autoHighlight
              />

              <ComboboxGeneric
                items={CDU_OPTIONS}
                value={cdus}
                onValueChange={setCdus}
                itemToValue={(item) => item.id}
                itemToLabel={(item) => item.name}
                label="CDU"
                placeholder="Select CDU values"
                autoHighlight
              />

              <ComboboxGeneric
                items={GRADE_OPTIONS}
                value={grades}
                onValueChange={setGrades}
                itemToValue={(item) => item.id}
                itemToLabel={(item) => item.name}
                label="Grade"
                placeholder="Select grades"
                autoHighlight
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min-year-built">Min Year Built</Label>
                <Input
                  id="min-year-built"
                  value={minYearBuilt}
                  onChange={(e) => setMinYearBuilt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-year-built">Max Year Built</Label>
                <Input
                  id="max-year-built"
                  value={maxYearBuilt}
                  onChange={(e) => setMaxYearBuilt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-total-area">Min Total Area</Label>
                <Input
                  id="min-total-area"
                  value={minTotalArea}
                  onChange={(e) => setMinTotalArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-total-area">Max Total Area</Label>
                <Input
                  id="max-total-area"
                  value={maxTotalArea}
                  onChange={(e) => setMaxTotalArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-gla">Min GLA</Label>
                <Input
                  id="min-gla"
                  value={minGla}
                  onChange={(e) => setMinGla(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-gla">Max GLA</Label>
                <Input
                  id="max-gla"
                  value={maxGla}
                  onChange={(e) => setMaxGla(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-story">Min Story</Label>
                <Input
                  id="min-story"
                  value={minStory}
                  onChange={(e) => setMinStory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-story">Max Story</Label>
                <Input
                  id="max-story"
                  value={maxStory}
                  onChange={(e) => setMaxStory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-total">Min Total</Label>
                <Input
                  id="min-total"
                  value={minTotal}
                  onChange={(e) => setMinTotal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-total">Max Total</Label>
                <Input
                  id="max-total"
                  value={maxTotal}
                  onChange={(e) => setMaxTotal(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label>Sort</Label>
                <Select
                  value={currentSort}
                  onValueChange={(value) => updateSimpleParam("sort", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Sort Direction</Label>
                <Select
                  value={currentSortAsc}
                  onValueChange={(value) =>
                    updateSimpleParam("sort_asc", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Limit</Label>
                <Select
                  value={currentLimit}
                  onValueChange={(value) => updateSimpleParam("limit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Map Settings</Label>
                <Dialog>
                  <div className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="min-w-0 text-xs text-muted-foreground">
                      <div className="truncate">
                        Style: {currentMapStyleLabel}
                      </div>
                      <div className="truncate">
                        Boundaries: {currentBoundaryLabel}
                      </div>
                    </div>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" type="button">
                        Edit
                      </Button>
                    </DialogTrigger>
                  </div>

                  <DialogContent className="z-[1000]">
                    <DialogHeader>
                      <DialogTitle>Map Settings</DialogTitle>
                      <DialogDescription>
                        Update map style and boundary layer for the neighborhood
                        report map.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Map Style</Label>
                        <Select
                          value={currentMapStyle}
                          onValueChange={(value) =>
                            updateSimpleParam("map_style", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAP_STYLE_OPTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Show Boundaries</Label>
                        <Select
                          value={showBoundaries}
                          onValueChange={handleBoundariesChange}
                        >
                          <SelectTrigger>
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
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || applyingFilters || !hasChanges}
              >
                {applyingFilters
                  ? "Applying..."
                  : hasChanges
                    ? "Apply Filters"
                    : "Filters Applied"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                disabled={isLoading || applyingFilters}
              >
                Clear
              </Button>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeChip(chip)}
                  >
                    {chip.label} ×
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Showing {rows.length} rows.
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
