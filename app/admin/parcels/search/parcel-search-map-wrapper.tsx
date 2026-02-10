"use client";

import dynamic from "next/dynamic";
import type { Tables } from "@/database-types";

interface ParcelSearchMapWrapperProps {
  parcels: Tables<"parcel_search_table">[];
}

const ParcelSearchMap = dynamic(() => import("./parcel-search-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function ParcelSearchMapWrapper({
  parcels,
}: ParcelSearchMapWrapperProps) {
  return <ParcelSearchMap parcels={parcels} />;
}
