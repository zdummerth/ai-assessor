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

async function Employees() {
  const { data: employees, error } = await getEmployees();

  if (error) {
    return <div>Error loading employees: {error.message}</div>;
  }

  if (!employees || employees.length === 0) {
    return <div>No employees found.</div>;
  }
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
      </CardContent>
    </Card>
  );
}

export default async function AdminEmployeesPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Suspense fallback={<TableSkeleton />}>
        <Employees />
      </Suspense>
    </div>
  );
}
