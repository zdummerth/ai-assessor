"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressWithMap } from "@/components/ui/address-with-map";
import type { NeighborhoodReportRow } from "./types";

interface NeighborhoodReportTableProps {
  rows: NeighborhoodReportRow[];
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString();
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US");
}

export default function NeighborhoodReportTable({
  rows,
}: NeighborhoodReportTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(rows.map((row) => row.id));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 w-12 bg-muted/50 px-4 py-3">
                <Checkbox
                  checked={
                    rows.length > 0 && selectedIds.length === rows.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                ID
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Parcel
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Neighborhood
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Report Timestamp
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Address
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Occupancy
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Cost Group
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                CDU
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Grade
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Year Built
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Total Area
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                GLA
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Story
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={15}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No neighborhood report rows found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="sticky left-0 z-10 w-12 bg-background px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.parcel_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.neighborhood || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(row.report_timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <AddressWithMap address={row.address} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row.occupancy)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.cost_group || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.cdu || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.grade || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row.year_built)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row.total_area)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row.gla)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row.story)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatNumber(row.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
