"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/database-types";
import SalesMapWrapper from "./sales-map-wrapper";
import SearchControls from "./search-controls";
import SalesTable from "./data-table";
import { NeighborhoodsLoading } from "@/components/neighborhoods-loading";

interface SalesSearchTabsProps {
  salesData: Tables<"sales_summary">[];
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function SalesSearchTabs({
  salesData,
  isLoading = false,
  errorMessage = null,
}: SalesSearchTabsProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {errorMessage}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-4">
        {/* Controls sidebar */}
        <div className="lg:col-span-1">
          <SearchControls salesData={salesData} isLoading={isLoading} />
        </div>

        {/* Content area with tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              {isLoading && salesData.length === 0 ? (
                <div className="w-full bg-muted rounded-lg flex items-center justify-center">
                  <NeighborhoodsLoading />
                </div>
              ) : (
                <SalesMapWrapper sales={salesData} isLoading={isLoading} />
              )}
            </TabsContent>

            <TabsContent value="table">
              {isLoading && salesData.length === 0 ? (
                <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
                  Loading data...
                </div>
              ) : (
                <SalesTable sales={salesData} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
