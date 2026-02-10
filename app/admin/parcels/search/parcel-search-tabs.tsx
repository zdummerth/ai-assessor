"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/database-types";
import ParcelsTable from "./data-table";
import ParcelSearchMapWrapper from "./parcel-search-map-wrapper";

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
  return (
    <Tabs defaultValue="table" className="w-full">
      <TabsList>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="map">Map</TabsTrigger>
      </TabsList>

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
