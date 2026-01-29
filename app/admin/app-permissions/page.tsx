import AppPermissionComboboxLookup from "../app-permissions/combobox-lookup";

export default function Page() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">App Permissions</h1>
      <AppPermissionComboboxLookup />
    </div>
  );
}
