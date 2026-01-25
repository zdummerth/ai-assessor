// import { getEmployees } from "./actions";
import EmployeesCrudUI from "./crud";

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
      <EmployeesCrudUI />
    </div>
  );
}
