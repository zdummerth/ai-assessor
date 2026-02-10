"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tables } from "@/database-types";

interface ParcelsTableProps {
  parcels: Tables<"parcel_search_table">[];
}

export default function ParcelsTable({ parcels }: ParcelsTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
        </div>
      )}
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
              <th className="text-left p-3 font-medium">Parcel ID</th>
              <th className="text-left p-3 font-medium">Address</th>
              <th className="text-left p-3 font-medium">Owner Name</th>
              <th className="text-right p-3 font-medium">Appraised Total</th>
              <th className="text-left p-3 font-medium">Neighborhood</th>
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
                <td className="p-3 font-medium">{parcel.parcel_id || "—"}</td>
                <td className="p-3 text-muted-foreground">
                  {formatAddress(parcel)}
                </td>
                <td className="p-3">{parcel.owner_name || "—"}</td>
                <td className="p-3 text-right">
                  {formatCurrency(parcel.appraised_total)}
                </td>
                <td className="p-3">{parcel.assessor_neighborhood || "—"}</td>
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
