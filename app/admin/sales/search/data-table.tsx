"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { JsonViewerDialog } from "@/components/ui/json-viewer-dialog";
import type { Tables } from "@/database-types";

interface SalesTableProps {
  sales: Tables<"sales_summary">[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === sales.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sales.map((sale) => sale.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return value.toLocaleString();
  };

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 w-12 px-4 py-3">
                <Checkbox
                  checked={
                    sales.length > 0 && selectedIds.length === sales.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">ID</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Sale ID</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Sale Price</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Sale Date</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Sale Type</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Field Review</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Apartments</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">1 Bed</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">2 Bed</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">3 Bed</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Units</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Stories</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Garages</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Carports</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Full Baths</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Half Baths</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Ground Floor</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Total Area</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Living Area</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Basement</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Avg Year</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Buildings</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Building JSON</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">RCNLD w/ OBY</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">RCNLD w/ Land</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Res Cost JSON</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Land Area</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Parcels</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Centroid X</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Centroid Y</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Parcels JSON</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Appr. Ratio</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Cost Ratio</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Appr. Land</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Appr. Improv.</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Appr. Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan={37}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No sales found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-muted/50">
                  <td className="sticky left-0 z-10 bg-background w-12 px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(sale.id)}
                      onChange={() => toggleSelect(sale.id)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{sale.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{sale.sale_id || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.sale_price)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(sale.sale_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{sale.sale_type || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(sale.field_review_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_apartments)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_apartments_one_bed)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_apartments_two_bed)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_apartments_three_bed)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_units)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_stories)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_garages)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_carports)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_full_baths)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_half_baths)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.ground_floor_area)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.total_area)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.total_living_area)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.finished_basement_area)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.avg_year_built)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_buildings)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <JsonViewerDialog 
                      data={sale.building_json} 
                      title={`Building JSON - Sale ${sale.sale_id}`}
                      buttonText="View"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.struct_rcnld_with_oby)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.struct_rcnld_with_oby_and_land)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <JsonViewerDialog 
                      data={sale.res_cost_json} 
                      title={`Res Cost JSON - Sale ${sale.sale_id}`}
                      buttonText="View"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.land_area)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(sale.number_of_parcels)}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {sale.centroid_x ? Number(sale.centroid_x).toFixed(6) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {sale.centroid_y ? Number(sale.centroid_y).toFixed(6) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <JsonViewerDialog 
                      data={sale.parcels_json} 
                      title={`Parcels JSON - Sale ${sale.sale_id}`}
                      buttonText="View"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sale.current_appraised_ratio ? Number(sale.current_appraised_ratio).toFixed(3) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sale.cost_with_land_ratio ? Number(sale.cost_with_land_ratio).toFixed(3) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.appraised_land)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.appraised_improvements)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(sale.appraised_total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
