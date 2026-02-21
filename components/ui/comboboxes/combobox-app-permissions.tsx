"use client";
import { ComboboxGenericSWR } from "@/components/ui/comboboxes/combobox-generic-swr";
import type { Tables } from "@/database-types";

type AppPermission = Tables<"app_permissions">;
interface AppPermissionsApiResponse {
  data: AppPermission[];
}

interface ComboboxAppPermissionsProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function ComboboxAppPermissions({
  value,
  onValueChange,
  label = "Permissions",
  placeholder = "Select permissions...",
}: ComboboxAppPermissionsProps) {
  return (
    <ComboboxGenericSWR<AppPermissionsApiResponse, AppPermission, string>
      apiRoute="/api/app-permissions"
      swrKey="app-permissions"
      transformData={(response) => response.data ?? []}
      value={value}
      onValueChange={onValueChange}
      itemToValue={(item) => item.name}
      itemToLabel={(item) => item.name}
      label={label}
      placeholder={placeholder}
    />
  );
}
