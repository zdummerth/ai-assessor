import NeighborhoodExplorerClient from "./neighborhood-explorer-client";

type GeometryValue =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

export type AggregatedBoundaryData = {
  ward_id?: number;
  ward_name?: string;
  ward_geom?: GeometryValue | null;
  cda_neighborhood_id?: number;
  cda_neighborhood_name?: string;
  cda_neighborhood_geom?: GeometryValue | null;
  assessor_neighborhood_id?: number;
  assessor_neighborhood_name?: string;
  assessor_neighborhood_geom?: GeometryValue | null;
  occupancy?: string;
  parcel_count: number;
  appraised_sum: number;
  appraised_median: number;
  appraised_mean: number;
  appraised_max: number;
  res_total: number;
  res_avg: number;
  com_total: number;
  com_avg: number;
};

export default function AdminNeighborhoodExplorePage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-4">
      <NeighborhoodExplorerClient />
    </div>
  );
}
