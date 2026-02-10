"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tables } from "@/database-types";

interface ParcelsTableProps {
  parcels: Tables<"parcel_search_table">[];
  visibleColumns: (
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
    | "number_of_apartments"
  )[];
}

type SortColumn =
  | "parcel_id"
  | "low_address_number"
  | "street_name"
  | "owner_name"
  | "appraised_total"
  | "assessor_neighborhood"
  | "created_at"
  | "block"
  | "lot"
  | "ext"
  | "class_code"
  | "total_living_area"
  | "total_area"
  | "avg_year_built"
  | "number_of_apartments";

export default function ParcelsTable({
  parcels,
  visibleColumns,
}: ParcelsTableProps) {
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "parcel_id";
  const currentAsc = searchParams.get("sort_asc") !== "false";

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const createSortUrl = (column: SortColumn) => {
    const params = new URLSearchParams(searchParams);
    if (currentSort === column) {
      params.set("sort_asc", currentAsc ? "false" : "true");
    } else {
      params.set("sort", column);
      params.set("sort_asc", "true");
    }
    params.delete("page");
    return `?${params.toString()}`;
  };

  const SortHeader = ({
    column,
    children,
  }: {
    column: SortColumn;
    children: React.ReactNode;
  }) => {
    const isActive = currentSort === column;
    return (
      <a
        href={createSortUrl(column)}
        className={`inline-flex items-center gap-1 hover:text-foreground cursor-pointer ${
          isActive ? "font-semibold" : "text-muted-foreground"
        }`}
      >
        {children}
        <span className="text-xs">{isActive && (currentAsc ? "↑" : "↓")}</span>
      </a>
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === parcels.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(parcels.map((parcel) => parcel.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const formatAddress = (parcel: Tables<"parcel_search_table">) => {
    const number = parcel.low_address_number || "";
    const suffix = parcel.low_address_suffix
      ? ` ${parcel.low_address_suffix}`
      : "";
    const prefix = parcel.street_prefix_direction
      ? `${parcel.street_prefix_direction} `
      : "";
    const name = parcel.street_name || "";
    const type = parcel.street_type ? ` ${parcel.street_type}` : "";
    const zip = parcel.zip ? ` ${parcel.zip}` : "";

    return `${number}${suffix} ${prefix}${name}${type}${zip}`.trim();
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const shouldShow = (column: string) => visibleColumns.includes(column as any);

  return (
    <div className="space-y-4">
      <div>
        {selectedIds.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">
                <Checkbox
                  checked={
                    selectedIds.length === parcels.length && parcels.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              {shouldShow("parcel_id") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="parcel_id">Parcel ID</SortHeader>
                </th>
              )}
              {shouldShow("block") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="block">Block</SortHeader>
                </th>
              )}
              {shouldShow("lot") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="lot">Lot</SortHeader>
                </th>
              )}
              {shouldShow("ext") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="ext">Ext</SortHeader>
                </th>
              )}
              {shouldShow("address") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="street_name">Address</SortHeader>
                </th>
              )}
              {shouldShow("owner_name") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="owner_name">Owner Name</SortHeader>
                </th>
              )}
              {shouldShow("appraised_total") && (
                <th className="text-right p-3 font-medium">
                  <SortHeader column="appraised_total">
                    Appraised Total
                  </SortHeader>
                </th>
              )}
              {shouldShow("assessor_neighborhood") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="assessor_neighborhood">
                    Neighborhood
                  </SortHeader>
                </th>
              )}
              {shouldShow("class_code") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="class_code">Class Code</SortHeader>
                </th>
              )}
              {shouldShow("total_living_area") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="total_living_area">
                    Living Area
                  </SortHeader>
                </th>
              )}
              {shouldShow("total_area") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="total_area">Total Area</SortHeader>
                </th>
              )}
              {shouldShow("avg_year_built") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="avg_year_built">
                    Avg Year Built
                  </SortHeader>
                </th>
              )}
              {shouldShow("number_of_apartments") && (
                <th className="text-left p-3 font-medium">
                  <SortHeader column="number_of_apartments">
                    Apartments
                  </SortHeader>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel) => (
              <tr key={parcel.id} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.includes(parcel.id)}
                    onCheckedChange={() => toggleSelect(parcel.id)}
                    aria-label={`Select parcel ${parcel.parcel_id}`}
                  />
                </td>
                {shouldShow("parcel_id") && (
                  <td className="p-3 font-medium">{parcel.parcel_id || "—"}</td>
                )}
                {shouldShow("block") && (
                  <td className="p-3">{parcel.block || "—"}</td>
                )}
                {shouldShow("lot") && (
                  <td className="p-3">{parcel.lot || "—"}</td>
                )}
                {shouldShow("ext") && (
                  <td className="p-3">{parcel.ext || "—"}</td>
                )}
                {shouldShow("address") && (
                  <td className="p-3 text-muted-foreground">
                    {formatAddress(parcel)}
                  </td>
                )}
                {shouldShow("owner_name") && (
                  <td className="p-3">{parcel.owner_name || "—"}</td>
                )}
                {shouldShow("appraised_total") && (
                  <td className="p-3 text-right">
                    {formatCurrency(parcel.appraised_total)}
                  </td>
                )}
                {shouldShow("assessor_neighborhood") && (
                  <td className="p-3">{parcel.assessor_neighborhood || "—"}</td>
                )}
                {shouldShow("class_code") && (
                  <td className="p-3">{parcel.class_code || "—"}</td>
                )}
                {shouldShow("total_living_area") && (
                  <td className="p-3">{parcel.total_living_area || "—"}</td>
                )}
                {shouldShow("total_area") && (
                  <td className="p-3">{parcel.total_area || "—"}</td>
                )}
                {shouldShow("avg_year_built") && (
                  <td className="p-3">{parcel.avg_year_built || "—"}</td>
                )}
                {shouldShow("number_of_apartments") && (
                  <td className="p-3">{parcel.number_of_apartments || "—"}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {parcels.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No parcels found
        </div>
      )}
    </div>
  );
}
