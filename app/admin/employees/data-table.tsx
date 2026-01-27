"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UpsertEmployeeFormDialog } from "./upsert-employee-form";
import { DeleteButton } from "@/components/delete-button/client";
import type { Tables } from "@/database-types";

interface EmployeesTableProps {
  employees: Tables<"employees">[];
}

export default function EmployeesTable({ employees }: EmployeesTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((emp) => emp.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <DeleteButton
            table="employees"
            ids={selectedIds}
            revalidatePath="/protected/admin/employees"
            onSuccess={() => {
              setSelectedIds([]);
            }}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">
                <Checkbox
                  checked={
                    selectedIds.length === employees.length &&
                    employees.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Hire Date</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.includes(emp.id)}
                    onCheckedChange={() => toggleSelect(emp.id)}
                    aria-label={`Select ${emp.first_name} ${emp.last_name}`}
                  />
                </td>
                <td className="p-3">{`${emp.first_name} ${emp.last_name}`}</td>
                <td className="p-3 text-muted-foreground">
                  {emp.email || "—"}
                </td>
                <td className="p-3">{emp.hire_date}</td>
                <td className="p-3 capitalize">{emp.status}</td>
                <td className="p-3 capitalize">{emp.role}</td>
                <td className="p-3 flex gap-2">
                  <UpsertEmployeeFormDialog initialData={emp} />
                  <DeleteButton
                    table="employees"
                    ids={[emp.id]}
                    revalidatePath="/protected/admin/employees"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No employees yet
        </div>
      )}
    </div>
  );
}
