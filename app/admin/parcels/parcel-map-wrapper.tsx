"use client";

import dynamic from "next/dynamic";

interface ParcelGeometry {
  id: number;
  parcel_id: number;
  parcel_number: string | null;
  geom: {
    type: string;
    coordinates: number[][][][];
  };
}

interface ParcelMapWrapperProps {
  parcels: ParcelGeometry[];
}

// Dynamic import to avoid SSR issues with Leaflet
const ParcelMap = dynamic(() => import("./parcel-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function ParcelMapWrapper({ parcels }: ParcelMapWrapperProps) {
  return <ParcelMap parcels={parcels} />;
}
