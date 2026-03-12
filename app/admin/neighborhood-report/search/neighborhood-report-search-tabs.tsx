"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NeighborhoodsLoading } from "@/components/neighborhoods-loading";
import { Button } from "@/components/ui/button";
import NeighborhoodReportMapWrapper from "./neighborhood-report-map-wrapper";
import NeighborhoodReportTable from "./data-table";
import NeighborhoodReportCards from "./neighborhood-report-cards";
import SearchControls from "./search-controls";
import type { NeighborhoodReportRow } from "./types";

interface NeighborhoodReportSearchTabsProps {
  rows: NeighborhoodReportRow[];
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function NeighborhoodReportSearchTabs({
  rows,
  isLoading = false,
  errorMessage = null,
}: NeighborhoodReportSearchTabsProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="w-full flex flex-col gap-6">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-4">
        {!sidebarCollapsed && (
          <div className="lg:col-span-1">
            <SearchControls rows={rows} isLoading={isLoading} />
          </div>
        )}

        <div className={sidebarCollapsed ? "lg:col-span-4" : "lg:col-span-3"}>
          <div className="mb-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              {sidebarCollapsed ? "Show Filters" : "Hide Filters"}
            </Button>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              {isLoading && rows.length === 0 ? (
                <div className="w-full rounded-lg bg-muted flex items-center justify-center">
                  <NeighborhoodsLoading />
                </div>
              ) : (
                <NeighborhoodReportMapWrapper
                  rows={rows}
                  isLoading={isLoading}
                />
              )}
            </TabsContent>

            <TabsContent value="table">
              {isLoading && rows.length === 0 ? (
                <div className="h-[600px] w-full rounded-lg bg-muted flex items-center justify-center">
                  Loading data...
                </div>
              ) : (
                <NeighborhoodReportTable rows={rows} />
              )}
            </TabsContent>

            <TabsContent value="cards">
              {isLoading && rows.length === 0 ? (
                <div className="h-[600px] w-full rounded-lg bg-muted flex items-center justify-center">
                  Loading data...
                </div>
              ) : (
                <NeighborhoodReportCards rows={rows} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
