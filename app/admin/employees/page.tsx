import { getEmployees } from "./queries";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { UpsertEmployeeFormDialog } from "./upsert-employee-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EmployeesTable from "./data-table";
import Pagination from "@/components/ui/pagination";
const ITEMS_PER_PAGE = 15;

async function Employees({ page }: { page: number }) {
  const rangeStart = (page - 1) * ITEMS_PER_PAGE;
  const rangeEnd = rangeStart + ITEMS_PER_PAGE - 1;
  const {
    data: employees,
    error,
    count,
  } = await getEmployees(rangeStart, rangeEnd);

  if (error) {
    return <div>Error loading employees: {error.message}</div>;
  }

  if (!employees || employees.length === 0) {
    return <div>No employees found.</div>;
  }

  const totalPages = Math.ceil(count || 0 / ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage employee records and roles</CardDescription>
        </div>
        <UpsertEmployeeFormDialog />
      </CardHeader>
      <CardContent>
        <EmployeesTable employees={employees} />
        <Pagination totalPages={totalPages} />
      </CardContent>
    </Card>
  );
}

export default async function AdminEmployeesPage({
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
      <Suspense key={page} fallback={<TableSkeleton />}>
        <Employees page={page} />
      </Suspense>
    </div>
  );
}
