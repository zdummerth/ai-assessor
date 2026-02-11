import {
  getParcelSearchResults,
  getAssessorNeighborhoods,
  getCdaNeighborhoods,
  getWards,
} from "./queries";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import ParcelSearchTabs from "./parcel-search-tabs";
import Link from "next/link";

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

const DEFAULT_VISIBLE_COLUMNS: VisibleColumn[] = [
  "parcel_id",
  "address",
  "owner_name",
  "appraised_total",
  "assessor_neighborhood",
];

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

async function Parcels({
  limit,
  sortColumn,
  sortAscending,
  minAppraisedTotal,
  maxAppraisedTotal,
  minTotalLivingArea,
  maxTotalLivingArea,
  minTotalArea,
  maxTotalArea,
  minAvgYearBuilt,
  maxAvgYearBuilt,
  minNumberOfApartments,
  maxNumberOfApartments,
  visibleColumns,
}: {
  limit: number;
  sortColumn: string;
  sortAscending: boolean;
  minAppraisedTotal?: number;
  maxAppraisedTotal?: number;
  minTotalLivingArea?: number;
  maxTotalLivingArea?: number;
  minTotalArea?: number;
  maxTotalArea?: number;
  minAvgYearBuilt?: number;
  maxAvgYearBuilt?: number;
  minNumberOfApartments?: number;
  maxNumberOfApartments?: number;
  visibleColumns: VisibleColumn[];
}) {
  const { data: parcels, error } = await getParcelSearchResults(
    limit,
    sortColumn as Parameters<typeof getParcelSearchResults>[1],
    sortAscending,
    minAppraisedTotal,
    maxAppraisedTotal,
    minTotalLivingArea,
    maxTotalLivingArea,
    minTotalArea,
    maxTotalArea,
    minAvgYearBuilt,
    maxAvgYearBuilt,
    minNumberOfApartments,
    maxNumberOfApartments,
  );

  // Fetch boundary data for map layers
  const [assessorResult, cdaResult, wardsResult] = await Promise.all([
    getAssessorNeighborhoods(),
    getCdaNeighborhoods(),
    getWards(),
  ]);

  if (error) {
    return (
      <div>
        <div>Error loading parcels: {error.message}</div>
        <Link
          href="/admin/parcels/search"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Retry
        </Link>
      </div>
    );
  }

  if (!parcels || parcels.length === 0) {
    return <div>No parcels found.</div>;
  }

  return (
    <ParcelSearchTabs
      parcels={parcels}
      visibleColumns={visibleColumns}
      assessorNeighborhoods={(assessorResult.data || []) as BoundaryData[]}
      cdaNeighborhoods={(cdaResult.data || []) as BoundaryData[]}
      wards={(wardsResult.data || []) as BoundaryData[]}
    />
  );
}

export default async function AdminParcelSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{
    limit?: string;
    sort?: string;
    sort_asc?: string;
    min_appraised_total?: string;
    max_appraised_total?: string;
    min_total_living_area?: string;
    max_total_living_area?: string;
    min_total_area?: string;
    max_total_area?: string;
    min_avg_year_built?: string;
    max_avg_year_built?: string;
    min_number_of_apartments?: string;
    max_number_of_apartments?: string;
    columns?: string;
  }>;
}) {
  const params = await searchParams;
  const limit = params?.limit ? parseInt(params.limit, 10) : 10;
  const sortColumn = params?.sort || "parcel_id";
  const sortAscending = params?.sort_asc !== "false";
  const minAppraisedTotal = params?.min_appraised_total
    ? parseInt(params.min_appraised_total, 10)
    : undefined;
  const maxAppraisedTotal = params?.max_appraised_total
    ? parseInt(params.max_appraised_total, 10)
    : undefined;
  const minTotalLivingArea = params?.min_total_living_area
    ? parseInt(params.min_total_living_area, 10)
    : undefined;
  const maxTotalLivingArea = params?.max_total_living_area
    ? parseInt(params.max_total_living_area, 10)
    : undefined;
  const minTotalArea = params?.min_total_area
    ? parseInt(params.min_total_area, 10)
    : undefined;
  const maxTotalArea = params?.max_total_area
    ? parseInt(params.max_total_area, 10)
    : undefined;
  const minAvgYearBuilt = params?.min_avg_year_built
    ? parseInt(params.min_avg_year_built, 10)
    : undefined;
  const maxAvgYearBuilt = params?.max_avg_year_built
    ? parseInt(params.max_avg_year_built, 10)
    : undefined;
  const minNumberOfApartments = params?.min_number_of_apartments
    ? parseInt(params.min_number_of_apartments, 10)
    : undefined;
  const maxNumberOfApartments = params?.max_number_of_apartments
    ? parseInt(params.max_number_of_apartments, 10)
    : undefined;

  const columnsParam = params?.columns
    ? (params.columns.split(",") as VisibleColumn[])
    : DEFAULT_VISIBLE_COLUMNS;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <Suspense
        key={`${limit}-${sortColumn}-${sortAscending}-${minAppraisedTotal}-${maxAppraisedTotal}-${minTotalLivingArea}-${maxTotalLivingArea}-${minTotalArea}-${maxTotalArea}-${minAvgYearBuilt}-${maxAvgYearBuilt}-${minNumberOfApartments}-${maxNumberOfApartments}-${columnsParam.join(",")}`}
        fallback={<TableSkeleton />}
      >
        <Parcels
          limit={limit}
          sortColumn={sortColumn}
          sortAscending={sortAscending}
          minAppraisedTotal={minAppraisedTotal}
          maxAppraisedTotal={maxAppraisedTotal}
          minTotalLivingArea={minTotalLivingArea}
          maxTotalLivingArea={maxTotalLivingArea}
          minTotalArea={minTotalArea}
          maxTotalArea={maxTotalArea}
          minAvgYearBuilt={minAvgYearBuilt}
          maxAvgYearBuilt={maxAvgYearBuilt}
          minNumberOfApartments={minNumberOfApartments}
          maxNumberOfApartments={maxNumberOfApartments}
          visibleColumns={columnsParam}
        />
      </Suspense>
    </div>
  );
}
