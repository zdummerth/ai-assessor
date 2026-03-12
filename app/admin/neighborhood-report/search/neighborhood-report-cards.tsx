"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressWithMap } from "@/components/ui/address-with-map";
import type { NeighborhoodReportRow } from "./types";

interface NeighborhoodReportCardsProps {
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

export default function NeighborhoodReportCards({
  rows,
}: NeighborhoodReportCardsProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        No neighborhood report rows found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {rows.map((row) => (
        <Card key={row.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Parcel {row.parcel_id} · ID {row.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="font-medium">Neighborhood:</span>{" "}
              {row.neighborhood || "—"}
            </div>
            <div>
              <span className="font-medium">Year:</span>{" "}
              {formatNumber(row.year)}
            </div>
            <div>
              <span className="font-medium">Report Timestamp:</span>{" "}
              {formatDate(row.report_timestamp)}
            </div>
            <div>
              <span className="font-medium">Occupancy:</span>{" "}
              {formatNumber(row.occupancy)}
            </div>
            <div>
              <span className="font-medium">Cost Group:</span>{" "}
              {row.cost_group || "—"}
            </div>
            <div>
              <span className="font-medium">CDU:</span> {row.cdu || "—"}
            </div>
            <div>
              <span className="font-medium">Grade:</span> {row.grade || "—"}
            </div>
            <div>
              <span className="font-medium">Year Built:</span>{" "}
              {formatNumber(row.year_built)}
            </div>
            <div>
              <span className="font-medium">Total Area:</span>{" "}
              {formatNumber(row.total_area)}
            </div>
            <div>
              <span className="font-medium">GLA:</span> {formatNumber(row.gla)}
            </div>
            <div>
              <span className="font-medium">Story:</span>{" "}
              {formatNumber(row.story)}
            </div>
            <div>
              <span className="font-medium">Total:</span>{" "}
              {formatNumber(row.total)}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Address:</span>{" "}
              <AddressWithMap address={row.address} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
