"use client";

import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";

interface ParcelGeometry {
  id: number;
  parcel_id: number;
  parcel_number: string | null;
  geom: {
    type: string;
    coordinates: number[][][][]; // MultiPolygon structure
  };
}

interface ParcelMapProps {
  parcels: ParcelGeometry[];
}

function convertMultiPolygonToLatLng(
  coordinates: number[][][][],
): LatLngExpression[][] {
  // MultiPolygon: [[[[[lng, lat], [lng, lat], ...]]], ...]
  //@ts-expect-error // TypeScript issue with LatLngExpression
  return coordinates.map((polygon) =>
    polygon.map((ring) =>
      ring.map(([lng, lat]) => [lat, lng] as LatLngExpression),
    ),
  );
}

function getCenter(parcels: ParcelGeometry[]): [number, number] {
  if (parcels.length === 0) return [38.627, -90.199]; // St. Louis default

  // Calculate centroid from first parcel
  const firstParcel = parcels[0];
  if (firstParcel.geom?.coordinates?.length > 0) {
    const firstRing = firstParcel.geom.coordinates[0][0];
    if (firstRing.length > 0) {
      const [lng, lat] = firstRing[0];
      return [lat, lng];
    }
  }

  return [38.627, -90.199];
}

export default function ParcelMap({ parcels }: ParcelMapProps) {
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
        if (!parcel.geom?.coordinates) return null;

        const polygons = convertMultiPolygonToLatLng(parcel.geom.coordinates);

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
                {parcel.parcel_number && <p>Number: {parcel.parcel_number}</p>}
                <p className="text-sm text-gray-600">
                  Geometry ID: {parcel.id}
                </p>
              </div>
            </Popup>
          </Polygon>
        ));
      })}
    </MapContainer>
  );
}
