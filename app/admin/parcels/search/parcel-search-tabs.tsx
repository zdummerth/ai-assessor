"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Tables } from "@/database-types";
import ParcelsTable from "./data-table";
import ParcelSearchMapWrapper from "./parcel-search-map-wrapper";
import SearchControls from "./search-controls";

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

interface ParcelSearchTabsProps {
  parcels: Tables<"parcel_search_table">[];
  visibleColumns: VisibleColumn[];
}

export default function ParcelSearchTabs({
  parcels,
  visibleColumns,
}: ParcelSearchTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();

  const currentView = searchParams.get("view") === "map" ? "map" : "table";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "table") {
      params.delete("view");
    } else {
      params.set("view", value);
    }
    push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs
      value={currentView}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        <SearchControls visibleColumns={visibleColumns} />
      </div>

      <TabsContent value="table">
        <Card>
          <CardHeader>
            <CardTitle>Parcels</CardTitle>
            <CardDescription>
              Search and view parcel information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParcelsTable parcels={parcels} visibleColumns={visibleColumns} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="map">
        <Card>
          <CardHeader>
            <CardTitle>Parcel Map</CardTitle>
            <CardDescription>Viewing parcel geometry</CardDescription>
          </CardHeader>
          <CardContent>
            <ParcelSearchMapWrapper parcels={parcels} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
