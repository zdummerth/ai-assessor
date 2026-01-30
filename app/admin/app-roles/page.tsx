import { list } from "./queries";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
// import { AsyncSearchAppPermissions } from "@/components/ui/comboboxes/async-search-app-permissions";
import { ComboboxAppPermissions } from "@/components/ui/comboboxes/combobox-app-permissions";
import { UpsertFormDialog } from "./upsert-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DataTable from "./data-table";
import Pagination from "@/components/ui/pagination";
const ITEMS_PER_PAGE = 15;

async function Table({ page }: { page: number }) {
  const rangeStart = (page - 1) * ITEMS_PER_PAGE;
  const rangeEnd = rangeStart + ITEMS_PER_PAGE - 1;
  const { data, error, count } = await list(rangeStart, rangeEnd);

  if (error) {
    return <div>Error loading page: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No employees found.</div>;
  }

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>App Roles</CardTitle>
          <CardDescription>Manage app roles</CardDescription>
        </div>
        <UpsertFormDialog />
      </CardHeader>
      <CardContent>
        <DataTable rows={data} />
        <Pagination totalPages={totalPages} />
      </CardContent>
    </Card>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page, 10) : 1;
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* <AsyncSearchAppPermissions /> */}
      <ComboboxAppPermissions />
      <Suspense key={page} fallback={<TableSkeleton />}>
        <Table page={page} />
      </Suspense>
    </div>
  );
}
