"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ComboboxAppPermissions } from "@/components/ui/comboboxes/combobox-app-permissions";
import { assignPermissions } from "./actions";

interface UpsertRolePermissionFormProps {
  role: string;
  initialData?: string[];
  trigger?: React.ReactNode;
  onSuccess?: (data: unknown) => void;
  onError?: (message: string) => void;
}

export function UpsertRolePermissionForm({
  role,
  initialData,
  onSuccess,
  onError,
}: UpsertRolePermissionFormProps) {
  const [state, formAction, isPending] = useActionState(
    assignPermissions,
    null,
  );

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialData || [],
  );

  useEffect(() => {
    if (state?.success && !isPending) {
      onSuccess?.(state.data);
      toast.success(state.message);
    } else if (state && !state.success && !isPending) {
      onError?.(state.message);
      toast.error(state.message);
    }
  }, [state, isPending, onSuccess, onError]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <input
        type="hidden"
        name="permissions"
        value={selectedPermissions.join(",")}
      />
      <div className="space-y-2">
        <Label>Manage Permissions</Label>
        <ComboboxAppPermissions
          label="App Permissions"
          placeholder="Select permissions..."
          value={selectedPermissions}
          onValueChange={(value) => {
            setSelectedPermissions(value);
          }}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Assign Permissions"}
        </Button>
      </div>
    </form>
  );
}

export function UpsertRolePermissionFormDialog({
  role,
  initialData,
  trigger,
  onSuccess,
  onError,
}: UpsertRolePermissionFormProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (data: unknown) => {
    onSuccess?.(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default">Manage Permissions</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions for {role}</DialogTitle>
          <DialogDescription>
            Assign or remove permissions for this role.
          </DialogDescription>
        </DialogHeader>
        <UpsertRolePermissionForm
          role={role}
          initialData={initialData}
          onSuccess={handleSuccess}
          onError={onError}
        />
      </DialogContent>
    </Dialog>
  );
}

export default UpsertRolePermissionForm;
