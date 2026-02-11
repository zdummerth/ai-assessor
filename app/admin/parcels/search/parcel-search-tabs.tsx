"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type GeometryValue =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

type BoundaryData = {
  id: number;
  name: string;
  group: string | null;
  geom: GeometryValue | null;
};

interface ParcelSearchTabsProps {
  parcels: Tables<"parcel_search_table">[];
  visibleColumns: VisibleColumn[];
  assessorNeighborhoods: BoundaryData[];
  cdaNeighborhoods: BoundaryData[];
  wards: BoundaryData[];
}

export default function ParcelSearchTabs({
  parcels,
  visibleColumns,
  assessorNeighborhoods,
  cdaNeighborhoods,
  wards,
}: ParcelSearchTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();

  const currentView = searchParams.get("view") === "map" ? "map" : "table";
  const currentBoundary =
    (searchParams.get("boundary") as
      | "none"
      | "cda"
      | "assessor"
      | "ward"
      | null) || "none";
  const currentMapStyle =
    (searchParams.get("map_style") as
      | "osm"
      | "carto-light"
      | "carto-dark"
      | "stadia-light"
      | "stadia-dark"
      | null) || "osm";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "table") {
      params.delete("view");
    } else {
      params.set("view", value);
    }
    push(`${pathname}?${params.toString()}`);
  };

  const handleBoundaryChange = (boundary: string) => {
    const params = new URLSearchParams(searchParams);
    if (boundary === "none") {
      params.delete("boundary");
    } else {
      params.set("boundary", boundary);
    }
    push(`${pathname}?${params.toString()}`);
  };

  const handleMapStyleChange = (style: string) => {
    const params = new URLSearchParams(searchParams);
    if (style === "osm") {
      params.delete("map_style");
    } else {
      params.set("map_style", style);
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
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Boundary Layer:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        currentBoundary === "none" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("none")}
                    >
                      None
                    </Button>
                    <Button
                      variant={
                        currentBoundary === "cda" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("cda")}
                    >
                      CDA Neighborhoods
                    </Button>
                    <Button
                      variant={
                        currentBoundary === "assessor" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("assessor")}
                    >
                      Assessor Neighborhoods
                    </Button>
                    <Button
                      variant={
                        currentBoundary === "ward" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("ward")}
                    >
                      Wards
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Map Style:</span>
                  <Select
                    value={currentMapStyle}
                    onValueChange={handleMapStyleChange}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select map style" />
                    </SelectTrigger>
                    <SelectContent className="z-[1000]">
                      <SelectItem value="osm">OpenStreetMap</SelectItem>
                      <SelectItem value="carto-light">
                        CARTO Positron (Light)
                      </SelectItem>
                      <SelectItem value="carto-dark">
                        CARTO Dark Matter
                      </SelectItem>
                      <SelectItem value="stadia-light">
                        Stadia Alidade Light
                      </SelectItem>
                      <SelectItem value="stadia-dark">
                        Stadia Alidade Dark
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ParcelSearchMapWrapper
                parcels={parcels}
                assessorNeighborhoods={assessorNeighborhoods}
                cdaNeighborhoods={cdaNeighborhoods}
                wards={wards}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
