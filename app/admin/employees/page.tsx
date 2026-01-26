import EmployeesCrudUI from "./crud";
import { getEmployees } from "./actions";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";

async function EmployeesList() {
  const { data: employees, error } = await getEmployees();

  if (error) {
    return <div>Error loading employees: {error.message}</div>;
  }
  return <EmployeesCrudUI employees={employees || []} />;
}

export default async function AdminEmployeesPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage employees and permissions
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <EmployeesList />
      </Suspense>
    </div>
  );
}
