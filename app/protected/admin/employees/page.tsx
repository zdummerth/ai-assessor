// import { getEmployees } from "./actions";
import EmployeesCrudUI from "./crud";
import { getEmployees } from "./actions";
import { Suspense } from "react";

async function EmployeesList() {
  const { data: employees, error } = await getEmployees();

  if (error) {
    return <div>Error loading employees: {error.message}</div>;
  }
  return <EmployeesCrudUI employees={employees || []} />;
}

export default async function AdminEmployeesPage() {
  //   const { data: employees } = await getEmployees();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage employees and permissions
        </p>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-8 text-muted-foreground">
            Loading employees...
          </div>
        }
      >
        <EmployeesList />
      </Suspense>
    </div>
  );
}
