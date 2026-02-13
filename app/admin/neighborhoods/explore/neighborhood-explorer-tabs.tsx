"use client";

import NeighborhoodExplorerMapWrapper from "./neighborhood-explorer-map-wrapper";
import NeighborhoodControls from "./neighborhood-controls";
import type { AggregatedBoundaryData } from "./page";
import type { AggregateType } from "./queries";

interface NeighborhoodExplorerTabsProps {
  aggregatedData: AggregatedBoundaryData[];
  aggregateType: AggregateType;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function NeighborhoodExplorerTabs({
  aggregatedData,
  aggregateType,
  isLoading = false,
  errorMessage = null,
}: NeighborhoodExplorerTabsProps) {
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
          <NeighborhoodControls
            aggregatedData={aggregatedData}
            aggregateType={aggregateType}
            isLoading={isLoading}
          />
        </div>

        {/* Map area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
              Loading map...
            </div>
          ) : (
            <NeighborhoodExplorerMapWrapper
              aggregatedData={aggregatedData}
              aggregateType={aggregateType}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
