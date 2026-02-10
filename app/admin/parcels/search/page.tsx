import { getParcelSearchResults } from "./queries";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import SearchControls from "./search-controls";
import ParcelSearchTabs from "./parcel-search-tabs";

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
    sortColumn as any,
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

  if (error) {
    return <div>Error loading parcels: {error.message}</div>;
  }

  if (!parcels || parcels.length === 0) {
    return <div>No parcels found.</div>;
  }

  return <ParcelSearchTabs parcels={parcels} visibleColumns={visibleColumns} />;
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
      <SearchControls visibleColumns={columnsParam} />
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
