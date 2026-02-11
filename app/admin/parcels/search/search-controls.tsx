"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type VisibleColumn =
  | "parcel_id"
  | "address"
  | "owner_name"
  | "appraised_total"
  | "assessor_neighborhood"
  | "block"
  | "lot"
  | "ext"
  | "class_code"
  | "total_living_area"
  | "total_area"
  | "avg_year_built"
  | "number_of_apartments";

interface SearchControlsProps {
  visibleColumns: VisibleColumn[];
}

const ALL_COLUMNS: { id: VisibleColumn; label: string }[] = [
  { id: "parcel_id", label: "Parcel ID" },
  { id: "address", label: "Address" },
  { id: "owner_name", label: "Owner Name" },
  { id: "appraised_total", label: "Appraised Total" },
  { id: "assessor_neighborhood", label: "Neighborhood" },
  { id: "block", label: "Block" },
  { id: "lot", label: "Lot" },
  { id: "ext", label: "Ext" },
  { id: "class_code", label: "Class Code" },
  { id: "total_living_area", label: "Living Area" },
  { id: "total_area", label: "Total Area" },
  { id: "avg_year_built", label: "Avg Year Built" },
  { id: "number_of_apartments", label: "Apartments" },
];

export default function SearchControls({
  visibleColumns: initialVisibleColumns,
}: SearchControlsProps) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Local state for all filter inputs
  const [localLimit, setLocalLimit] = useState(
    searchParams.get("limit") || "10",
  );
  const [localMinAppraised, setLocalMinAppraised] = useState(
    searchParams.get("min_appraised_total") || "",
  );
  const [localMaxAppraised, setLocalMaxAppraised] = useState(
    searchParams.get("max_appraised_total") || "",
  );
  const [localMinLivingArea, setLocalMinLivingArea] = useState(
    searchParams.get("min_total_living_area") || "",
  );
  const [localMaxLivingArea, setLocalMaxLivingArea] = useState(
    searchParams.get("max_total_living_area") || "",
  );
  const [localMinTotalArea, setLocalMinTotalArea] = useState(
    searchParams.get("min_total_area") || "",
  );
  const [localMaxTotalArea, setLocalMaxTotalArea] = useState(
    searchParams.get("max_total_area") || "",
  );
  const [localMinYearBuilt, setLocalMinYearBuilt] = useState(
    searchParams.get("min_avg_year_built") || "",
  );
  const [localMaxYearBuilt, setLocalMaxYearBuilt] = useState(
    searchParams.get("max_avg_year_built") || "",
  );
  const [localMinApartments, setLocalMinApartments] = useState(
    searchParams.get("min_number_of_apartments") || "",
  );
  const [localMaxApartments, setLocalMaxApartments] = useState(
    searchParams.get("max_number_of_apartments") || "",
  );
  const [localVisibleColumns, setLocalVisibleColumns] = useState(
    initialVisibleColumns,
  );
  const [isApplying, setIsApplying] = useState(false);

  // Sync local state with URL params when they change externally
  useEffect(() => {
    setLocalLimit(searchParams.get("limit") || "10");
    setLocalMinAppraised(searchParams.get("min_appraised_total") || "");
    setLocalMaxAppraised(searchParams.get("max_appraised_total") || "");
    setLocalMinLivingArea(searchParams.get("min_total_living_area") || "");
    setLocalMaxLivingArea(searchParams.get("max_total_living_area") || "");
    setLocalMinTotalArea(searchParams.get("min_total_area") || "");
    setLocalMaxTotalArea(searchParams.get("max_total_area") || "");
    setLocalMinYearBuilt(searchParams.get("min_avg_year_built") || "");
    setLocalMaxYearBuilt(searchParams.get("max_avg_year_built") || "");
    setLocalMinApartments(searchParams.get("min_number_of_apartments") || "");
    setLocalMaxApartments(searchParams.get("max_number_of_apartments") || "");
    setLocalVisibleColumns(initialVisibleColumns);
    setIsApplying(false);
  }, [searchParams, initialVisibleColumns]);

  // Check if local state differs from URL params
  const hasChanges =
    localLimit !== (searchParams.get("limit") || "10") ||
    localMinAppraised !== (searchParams.get("min_appraised_total") || "") ||
    localMaxAppraised !== (searchParams.get("max_appraised_total") || "") ||
    localMinLivingArea !== (searchParams.get("min_total_living_area") || "") ||
    localMaxLivingArea !== (searchParams.get("max_total_living_area") || "") ||
    localMinTotalArea !== (searchParams.get("min_total_area") || "") ||
    localMaxTotalArea !== (searchParams.get("max_total_area") || "") ||
    localMinYearBuilt !== (searchParams.get("min_avg_year_built") || "") ||
    localMaxYearBuilt !== (searchParams.get("max_avg_year_built") || "") ||
    localMinApartments !==
      (searchParams.get("min_number_of_apartments") || "") ||
    localMaxApartments !==
      (searchParams.get("max_number_of_apartments") || "") ||
    localVisibleColumns.join(",") !== initialVisibleColumns.join(",");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);

    const params = new URLSearchParams(searchParams);

    // Set limit
    params.set("limit", localLimit);

    // Set min appraised total
    if (localMinAppraised) {
      params.set("min_appraised_total", localMinAppraised);
    } else {
      params.delete("min_appraised_total");
    }

    // Set max appraised total
    if (localMaxAppraised) {
      params.set("max_appraised_total", localMaxAppraised);
    } else {
      params.delete("max_appraised_total");
    }

    // Set min total living area
    if (localMinLivingArea) {
      params.set("min_total_living_area", localMinLivingArea);
    } else {
      params.delete("min_total_living_area");
    }

    // Set max total living area
    if (localMaxLivingArea) {
      params.set("max_total_living_area", localMaxLivingArea);
    } else {
      params.delete("max_total_living_area");
    }

    // Set min total area
    if (localMinTotalArea) {
      params.set("min_total_area", localMinTotalArea);
    } else {
      params.delete("min_total_area");
    }

    // Set max total area
    if (localMaxTotalArea) {
      params.set("max_total_area", localMaxTotalArea);
    } else {
      params.delete("max_total_area");
    }

    // Set min average year built
    if (localMinYearBuilt) {
      params.set("min_avg_year_built", localMinYearBuilt);
    } else {
      params.delete("min_avg_year_built");
    }

    // Set max average year built
    if (localMaxYearBuilt) {
      params.set("max_avg_year_built", localMaxYearBuilt);
    } else {
      params.delete("max_avg_year_built");
    }

    // Set min number of apartments
    if (localMinApartments) {
      params.set("min_number_of_apartments", localMinApartments);
    } else {
      params.delete("min_number_of_apartments");
    }

    // Set max number of apartments
    if (localMaxApartments) {
      params.set("max_number_of_apartments", localMaxApartments);
    } else {
      params.delete("max_number_of_apartments");
    }

    // Set visible columns
    params.set("columns", localVisibleColumns.join(","));

    push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const toggleColumn = (columnId: VisibleColumn) => {
    if (localVisibleColumns.includes(columnId)) {
      setLocalVisibleColumns(
        localVisibleColumns.filter((col) => col !== columnId),
      );
    } else {
      setLocalVisibleColumns([...localVisibleColumns, columnId]);
    }
  };

  const activeFilters = useMemo(
    () =>
      [
        {
          key: "min_appraised_total",
          label: "Min Appraised",
          value: searchParams.get("min_appraised_total"),
        },
        {
          key: "max_appraised_total",
          label: "Max Appraised",
          value: searchParams.get("max_appraised_total"),
        },
        {
          key: "min_total_living_area",
          label: "Min Living Area",
          value: searchParams.get("min_total_living_area"),
        },
        {
          key: "max_total_living_area",
          label: "Max Living Area",
          value: searchParams.get("max_total_living_area"),
        },
        {
          key: "min_total_area",
          label: "Min Total Area",
          value: searchParams.get("min_total_area"),
        },
        {
          key: "max_total_area",
          label: "Max Total Area",
          value: searchParams.get("max_total_area"),
        },
        {
          key: "min_avg_year_built",
          label: "Min Year Built",
          value: searchParams.get("min_avg_year_built"),
        },
        {
          key: "max_avg_year_built",
          label: "Max Year Built",
          value: searchParams.get("max_avg_year_built"),
        },
        {
          key: "min_number_of_apartments",
          label: "Min Apartments",
          value: searchParams.get("min_number_of_apartments"),
        },
        {
          key: "max_number_of_apartments",
          label: "Max Apartments",
          value: searchParams.get("max_number_of_apartments"),
        },
      ].filter((filter) => filter.value),
    [searchParams],
  );

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    [
      "min_appraised_total",
      "max_appraised_total",
      "min_total_living_area",
      "max_total_living_area",
      "min_total_area",
      "max_total_area",
      "min_avg_year_built",
      "max_avg_year_built",
      "min_number_of_apartments",
      "max_number_of_apartments",
    ].forEach((key) => params.delete(key));
    push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Edit Filters
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl z-[1000]">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="limit"
                  className="text-sm font-medium mb-1 block"
                >
                  Rows to Show
                </label>
                <select
                  id="limit"
                  value={localLimit}
                  onChange={(e) => setLocalLimit(e.target.value)}
                  className="w-full px-2 py-2 border border-input rounded bg-background text-sm"
                >
                  <option value="10">10 rows</option>
                  <option value="25">25 rows</option>
                  <option value="100">100 rows</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="min_appraised"
                  className="text-sm font-medium mb-1 block"
                >
                  Min Appraised Total
                </label>
                <Input
                  id="min_appraised"
                  type="number"
                  placeholder="Min value"
                  value={localMinAppraised}
                  onChange={(e) => setLocalMinAppraised(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="max_appraised"
                  className="text-sm font-medium mb-1 block"
                >
                  Max Appraised Total
                </label>
                <Input
                  id="max_appraised"
                  type="number"
                  placeholder="Max value"
                  value={localMaxAppraised}
                  onChange={(e) => setLocalMaxAppraised(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="min_living_area"
                  className="text-sm font-medium mb-1 block"
                >
                  Min Living Area
                </label>
                <Input
                  id="min_living_area"
                  type="number"
                  placeholder="Min value"
                  value={localMinLivingArea}
                  onChange={(e) => setLocalMinLivingArea(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="max_living_area"
                  className="text-sm font-medium mb-1 block"
                >
                  Max Living Area
                </label>
                <Input
                  id="max_living_area"
                  type="number"
                  placeholder="Max value"
                  value={localMaxLivingArea}
                  onChange={(e) => setLocalMaxLivingArea(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="min_total_area"
                  className="text-sm font-medium mb-1 block"
                >
                  Min Total Area
                </label>
                <Input
                  id="min_total_area"
                  type="number"
                  placeholder="Min value"
                  value={localMinTotalArea}
                  onChange={(e) => setLocalMinTotalArea(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="max_total_area"
                  className="text-sm font-medium mb-1 block"
                >
                  Max Total Area
                </label>
                <Input
                  id="max_total_area"
                  type="number"
                  placeholder="Max value"
                  value={localMaxTotalArea}
                  onChange={(e) => setLocalMaxTotalArea(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="min_year_built"
                  className="text-sm font-medium mb-1 block"
                >
                  Min Year Built
                </label>
                <Input
                  id="min_year_built"
                  type="number"
                  placeholder="Min year"
                  value={localMinYearBuilt}
                  onChange={(e) => setLocalMinYearBuilt(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="max_year_built"
                  className="text-sm font-medium mb-1 block"
                >
                  Max Year Built
                </label>
                <Input
                  id="max_year_built"
                  type="number"
                  placeholder="Max year"
                  value={localMaxYearBuilt}
                  onChange={(e) => setLocalMaxYearBuilt(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="min_apartments"
                  className="text-sm font-medium mb-1 block"
                >
                  Min Apartments
                </label>
                <Input
                  id="min_apartments"
                  type="number"
                  placeholder="Min count"
                  value={localMinApartments}
                  onChange={(e) => setLocalMinApartments(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="max_apartments"
                  className="text-sm font-medium mb-1 block"
                >
                  Max Apartments
                </label>
                <Input
                  id="max_apartments"
                  type="number"
                  placeholder="Max count"
                  value={localMaxApartments}
                  onChange={(e) => setLocalMaxApartments(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Columns
                </label>
                <div className="border border-input rounded p-2 bg-background max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {ALL_COLUMNS.map((col) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`col-${col.id}`}
                          checked={localVisibleColumns.includes(col.id)}
                          onCheckedChange={() => toggleColumn(col.id)}
                        />
                        <Label
                          htmlFor={`col-${col.id}`}
                          className="text-xs font-normal cursor-pointer"
                        >
                          {col.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!hasChanges || isApplying}
                className="w-24"
              >
                {isApplying ? "Applying..." : "Apply"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <span className="text-xs">
                  {filter.label}: {filter.value}
                </span>
                <button
                  type="button"
                  onClick={() => clearFilter(filter.key)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Clear ${filter.label}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
