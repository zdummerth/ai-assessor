"use client";

import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import type { Tables } from "@/database-types";

type GeometryValue =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

interface ParcelSearchMapProps {
  parcels: Tables<"parcel_search_table">[];
}

function convertPolygonToLatLng(
  coordinates: number[][][],
): LatLngExpression[][] {
  return coordinates.map((ring) =>
    ring.map(([lng, lat]) => [lat, lng] as LatLngExpression),
  );
}

function getPolygons(geometry: GeometryValue | null): LatLngExpression[][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    return [convertPolygonToLatLng(geometry.coordinates)];
  }

  return geometry.coordinates.map((polygon) => convertPolygonToLatLng(polygon));
}

function getCenter(parcels: Tables<"parcel_search_table">[]): [number, number] {
  if (parcels.length === 0) return [38.627, -90.199];

  const firstParcel = parcels[0];
  const geometry = firstParcel.geometry as GeometryValue | null;
  if (!geometry) return [38.627, -90.199];

  const polygons = getPolygons(geometry);
  if (polygons.length > 0 && polygons[0].length > 0) {
    const firstRing = polygons[0][0];
    if (firstRing.length > 0) {
      const [lat, lng] = firstRing[0] as [number, number];
      return [lat, lng];
    }
  }

  return [38.627, -90.199];
}

export default function ParcelSearchMap({ parcels }: ParcelSearchMapProps) {
  const center = getCenter(parcels);

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "600px", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {parcels.map((parcel) => {
        const geometry = parcel.geometry as GeometryValue | null;
        if (!geometry) return null;

        const polygons = getPolygons(geometry);

        return polygons.map((polygon, idx) => (
          <Polygon
            key={`${parcel.id}-${idx}`}
            positions={polygon}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#60a5fa",
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <p className="font-semibold">Parcel ID: {parcel.parcel_id}</p>
                {parcel.collector_parcel_id && (
                  <p>Collector ID: {parcel.collector_parcel_id}</p>
                )}
              </div>
            </Popup>
          </Polygon>
        ));
      })}
    </MapContainer>
  );
}
