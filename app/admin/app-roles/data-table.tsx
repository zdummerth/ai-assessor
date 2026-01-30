"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UpsertFormDialog } from "./upsert-form";
import { UpsertRolePermissionFormDialog } from "../role-permission/upsert-form";
import { DeleteButton } from "@/components/delete-button/client";
import type { Tables } from "@/database-types";
import { Rows3Icon } from "lucide-react";

type AppRoleRow = Tables<"app_roles"> & {
  role_permissions?: Tables<"role_permissions">[];
};

interface TableProps {
  rows: AppRoleRow[];
}

export default function Table({ rows }: TableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((r) => r.name));
    }
  };

  const toggleSelect = (name: string) => {
    setSelectedIds((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
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
            table="app_roles"
            ids={selectedIds}
            revalidatePath="/protected/admin/app_roles"
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
                    selectedIds.length === rows.length && Rows3Icon.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-left p-3 font-medium">Permissions</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.includes(r.name)}
                    onCheckedChange={() => toggleSelect(r.name)}
                    aria-label={`Select ${r.name} ${r.description}`}
                  />
                </td>
                <td className="p-3">{`${r.name}`}</td>
                <td className="p-3 text-muted-foreground">
                  {r.description || "—"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {r.role_permissions?.map((rp) => rp.permission).join(" - ")}
                </td>
                <td className="p-3 flex gap-2">
                  <UpsertRolePermissionFormDialog
                    role={r.name}
                    initialData={
                      r.role_permissions?.map((rp) => rp.permission) || []
                    }
                  />
                  <UpsertFormDialog initialData={r} />
                  <DeleteButton
                    table="app_roles"
                    ids={[r.name]}
                    revalidatePath="/protected/admin/app_roles"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No records found.
        </div>
      )}
    </div>
  );
}
