"use client";
import { list } from "../app-permissions/queries";
import { ComboboxWithFetcher } from "@/components/ui/comboboxes/combobox-with-fetcher";
import { Tables } from "@/database-types";

export default function AppPermissionComboboxLookup() {
  return (
    <ComboboxWithFetcher
      label="App Permission"
      placeholder="Select an app permission"
      swrKey="app-permission-lookup"
      fetcher={() => list(0, 999).then((res) => res.data || [])}
      onChange={(value) => {
        //   return (item: { id: string; name: string } | null) => {
        //     onPermissionSelect(item ? item.name : null);
        //   };
        console.log("onChange called: ", value);
      }}
      mode="multi"
      mapToOptions={(data) =>
        (data as Tables<"app_permissions">[]).map((d) => ({
          label: d.name,
          value: d.name,
        }))
      }
    />
  );
}
