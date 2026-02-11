"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
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

interface BoundaryData {
  id: number;
  name: string;
  group: string | null;
  geom: GeometryValue | null;
}

type BoundaryType = "none" | "cda" | "assessor" | "ward";
type MapStyle =
  | "osm"
  | "carto-light"
  | "carto-dark"
  | "stadia-light"
  | "stadia-dark";

interface ParcelSearchMapProps {
  parcels: Tables<"parcel_search_table">[];
  focusParcelId?: number;
  defaultCenter?: [number, number];
  boundaryType?: BoundaryType;
  mapStyle?: MapStyle;
  assessorNeighborhoods?: BoundaryData[];
  cdaNeighborhoods?: BoundaryData[];
  wards?: BoundaryData[];
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

function getCenterFromParcel(
  parcel: Tables<"parcel_search_table"> | undefined,
): [number, number] | null {
  if (!parcel) return null;
  const geometry = parcel.geometry as GeometryValue | null;
  if (!geometry) return null;

  const polygons = getPolygons(geometry);
  if (polygons.length > 0 && polygons[0].length > 0) {
    const firstRing = polygons[0][0];
    if (firstRing.length > 0) {
      const [lat, lng] = firstRing[0] as [number, number];
      return [lat, lng];
    }
  }

  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildDetailRows(parcel: Tables<"parcel_search_table">) {
  const geometry = parcel.geometry as GeometryValue | null;
  return [
    ["ID", parcel.id],
    ["Parcel ID", parcel.parcel_id],
    ["Collector Parcel ID", parcel.collector_parcel_id],
    ["Address Number", parcel.low_address_number],
    ["Address Suffix", parcel.low_address_suffix],
    ["Street Prefix", parcel.street_prefix_direction],
    ["Street Name", parcel.street_name],
    ["Street Type", parcel.street_type],
    ["Unit", parcel.std_unit_number],
    ["Zip", parcel.zip],
    ["Owner Name", parcel.owner_name],
    ["Owner Name 2", parcel.owner_name_2],
    ["Owner Address", parcel.owner_address],
    ["Owner City", parcel.owner_city],
    ["Owner State", parcel.owner_state],
    ["Owner Zip", parcel.owner_zip],
    ["Owner Country", parcel.owner_country],
    ["Geo Handle", parcel.geo_handle],
    ["Class Code", parcel.class_code],
    ["Occupancy", parcel.occupancy],
    ["Abatement Type", parcel.abatement_type],
    ["Abatement Start", parcel.abatement_start_year],
    ["Abatement End", parcel.abatement_end_year],
    ["SBD District 1", parcel.sbd_district_1],
    ["SBD District 2", parcel.sbd_district_2],
    ["SBD District 3", parcel.sbd_district_3],
    ["TIF District", parcel.tif_district],
    ["Land Area", parcel.land_area],
    ["Assessed Land", parcel.assessed_land],
    ["Assessed Improvements", parcel.assessed_improvements],
    ["Assessed Total", parcel.assessed_total],
    ["Assessed Res Land", parcel.assessed_res_land],
    ["Assessed Com Land", parcel.assessed_com_land],
    ["Assessed Agr Land", parcel.assessed_agr_land],
    ["Assessed Res Improvements", parcel.assessed_res_improvements],
    ["Assessed Com Improvements", parcel.assessed_com_improvements],
    ["Assessed Agr Improvements", parcel.assessed_agr_improvements],
    ["Appraised Land", parcel.appraised_land],
    ["Appraised Res Land", parcel.appraised_res_land],
    ["Appraised Com Land", parcel.appraised_com_land],
    ["Appraised Agr Land", parcel.appraised_agr_land],
    ["Appraised Res Improvements", parcel.appraised_res_improvements],
    ["Appraised Com Improvements", parcel.appraised_com_improvements],
    ["Appraised Agr Improvements", parcel.appraised_agr_improvements],
    ["Ward", parcel.ward],
    ["CDA Neighborhood", parcel.cda_neighborhood],
    ["Assessor Neighborhood", parcel.assessor_neighborhood],
    ["Appraised Total", parcel.appraised_total],
    ["Number of Apartments", parcel.number_of_apartments],
    ["Apartments 1 Bedroom", parcel.number_of_apartments_one_bedroom],
    ["Apartments 2 Bedroom", parcel.number_of_apartments_two_bedroom],
    ["Apartments 3 Bedroom", parcel.number_of_apartments_three_bedroom],
    ["Number of Units", parcel.number_of_units],
    ["Number of Stories", parcel.number_of_stories],
    ["Number of Garages", parcel.number_of_garages],
    ["Number of Carports", parcel.number_of_carports],
    ["Full Baths", parcel.number_of_full_baths],
    ["Half Baths", parcel.number_of_half_baths],
    ["Ground Floor Area", parcel.ground_floor_area],
    ["Total Area", parcel.total_area],
    ["Total Living Area", parcel.total_living_area],
    ["Finished Basement Area", parcel.finished_basement_area],
    ["Avg Year Built", parcel.avg_year_built],
    ["Number of Buildings", parcel.number_of_buildings],
    ["Building JSON", parcel.building_json],
    ["Cost JSON", parcel.cost_json],
    ["Struct RCNLD w/ Oby", parcel.struct_rcnld_with_oby],
    ["Struct RCNLD w/ Oby+Land", parcel.struct_rcnld_with_oby_and_land],
    ["Tax Status", parcel.tax_status],
    ["Property Class", parcel.property_class],
    ["Current Appraiser", parcel.current_appraiser],
    ["Block", parcel.block],
    ["Lot", parcel.lot],
    ["Ext", parcel.ext],
    ["Is Active", parcel.is_active],
    ["Created At", parcel.created_at],
    ["Updated At", parcel.updated_at],
    ["Geometry Type", geometry?.type],
  ] as Array<[string, unknown]>;
}

export default function ParcelSearchMap({
  parcels,
  focusParcelId,
  defaultCenter,
  boundaryType = "none",
  mapStyle = "osm",
  assessorNeighborhoods = [],
  cdaNeighborhoods = [],
  wards = [],
}: ParcelSearchMapProps) {
  const initialCenter = useMemo<[number, number]>(() => {
    const fallbackCenter: [number, number] = [38.627, -90.199];
    if (defaultCenter) return defaultCenter;
    const centerFromFirst = getCenterFromParcel(parcels[0]);
    return centerFromFirst || fallbackCenter;
  }, [defaultCenter, parcels]);

  const focusedParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === focusParcelId),
    [parcels, focusParcelId],
  );
  const focusCenter = useMemo<[number, number]>(() => {
    const focusedCenter = getCenterFromParcel(focusedParcel);
    return focusedCenter || initialCenter;
  }, [focusedParcel, initialCenter]);

  const tileConfig = useMemo(() => {
    switch (mapStyle) {
      case "carto-light":
        return {
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        };
      case "carto-dark":
        return {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        };
      case "stadia-light":
        return {
          url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
          attribution:
            "&copy; OpenStreetMap contributors &copy; Stadia Maps &copy; Stamen Design",
        };
      case "stadia-dark":
        return {
          url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
          attribution:
            "&copy; OpenStreetMap contributors &copy; Stadia Maps &copy; Stamen Design",
        };
      default:
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
    }
  }, [mapStyle]);

  // Determine which boundaries to show based on boundaryType
  const boundariesToShow = useMemo(() => {
    switch (boundaryType) {
      case "cda":
        return cdaNeighborhoods;
      case "assessor":
        return assessorNeighborhoods;
      case "ward":
        return wards;
      default:
        return [];
    }
  }, [boundaryType, cdaNeighborhoods, assessorNeighborhoods, wards]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={16}
      style={{ height: "600px", width: "100%" }}
      // className="rounded-lg"
    >
      <MapUpdater center={focusCenter} />
      <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

      {/* Render selected boundary layer */}
      {boundariesToShow.map((boundary) => {
        if (!boundary.geom) return null;
        const polygons = getPolygons(boundary.geom);
        return polygons.map((polygon, idx) => (
          <Polygon
            key={`boundary-${boundary.id}-${idx}`}
            positions={polygon}
            pathOptions={{
              color: "#dc2626",
              fillColor: "#dc2626",
              fillOpacity: 0.05,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{boundary.name}</div>
                {boundary.group && (
                  <div className="text-xs text-muted-foreground">
                    {boundary.group}
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
        ));
      })}

      {/* Render parcels with high contrast color */}
      {parcels.map((parcel) => {
        const geometry = parcel.geometry as GeometryValue | null;
        if (!geometry) return null;

        const polygons = getPolygons(geometry);

        return polygons.map((polygon, idx) => (
          <Polygon
            key={`${parcel.id}-${idx}`}
            positions={polygon}
            pathOptions={{
              color: "#1e40af",
              fillColor: "#3b82f6",
              fillOpacity: 0.4,
              weight: 2,
            }}
          >
            <Popup>
              <div className="max-h-[300px] w-[280px] overflow-auto text-xs">
                <div className="font-semibold text-sm mb-2">
                  Parcel {parcel.parcel_id || parcel.id}
                </div>
                <div className="space-y-1">
                  {buildDetailRows(parcel).map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="font-medium text-muted-foreground">
                        {label}:
                      </span>
                      <span className="break-all">{renderValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Polygon>
        ));
      })}
    </MapContainer>
  );
}
