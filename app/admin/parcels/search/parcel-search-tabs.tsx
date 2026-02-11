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
    <Tabs value={currentView} onValueChange={handleTabChange}>
      <div className="flex h-[calc(100vh-90px)] w-full">
        {/* Left Sidebar - All Controls */}
        <div className="w-80 overflow-y-auto mr-4">
          <div className="space-y-6">
            {/* View Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">View</label>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
            </div>

            {/* Map-specific controls */}
            {currentView === "map" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Boundary Layer
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={
                        currentBoundary === "none" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("none")}
                      className="w-full"
                    >
                      None
                    </Button>
                    <Button
                      variant={
                        currentBoundary === "cda" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("cda")}
                      className="w-full"
                    >
                      CDA
                    </Button>
                    <Button
                      variant={
                        currentBoundary === "assessor" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("assessor")}
                      className="w-full"
                    >
                      Assessor
                    </Button>
                    <Button
                      variant={
                        currentBoundary === "ward" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleBoundaryChange("ward")}
                      className="w-full"
                    >
                      Wards
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Map Style
                  </label>
                  <Select
                    value={currentMapStyle}
                    onValueChange={handleMapStyleChange}
                  >
                    <SelectTrigger className="w-full">
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
            )}

            {/* Search Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Filters</label>
              <SearchControls visibleColumns={visibleColumns} />
            </div>
          </div>
        </div>

        {/* Right Main Area - Content Only */}
        <div className="w-full overflow-y-auto">
          <TabsContent value="table" className="h-full mt-0 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Parcels</CardTitle>
                <CardDescription>
                  Search and view parcel information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParcelsTable
                  parcels={parcels}
                  visibleColumns={visibleColumns}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="h-full mt-0 w-full">
            <Card className="h-full">
              <CardContent>
                <ParcelSearchMapWrapper
                  parcels={parcels}
                  assessorNeighborhoods={assessorNeighborhoods}
                  cdaNeighborhoods={cdaNeighborhoods}
                  wards={wards}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
