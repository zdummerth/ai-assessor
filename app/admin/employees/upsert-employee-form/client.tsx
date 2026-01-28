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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/database-types";
import { upsertEmployee } from "./actions";

interface UpsertEmployeeFormDialogProps {
  initialData?: Tables<"employees">;
  trigger?: React.ReactNode;
  onSuccess?: (data: unknown) => void;
  onError?: (message: string) => void;
}

export function UpsertEmployeeForm({
  initialData,
  onSuccess,
  onError,
}: UpsertEmployeeFormDialogProps) {
  const [state, formAction, isPending] = useActionState(upsertEmployee, null);

  useEffect(() => {
    if (state?.success && !isPending) {
      onSuccess?.(state.data);
      toast.success(state.message);
    } else if (state && !state.success && !isPending) {
      onError?.(state.message);
      toast.error(state.message);
    }
  }, [state, isPending, onSuccess, onError]);

  const isEditing = !!initialData?.id;

  return (
    <form action={formAction} className="space-y-4">
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          name="first_name"
          required
          defaultValue={initialData?.first_name || ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          name="last_name"
          required
          defaultValue={initialData?.last_name || ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialData?.email || ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hire_date">Hire Date</Label>
        <Input
          id="hire_date"
          name="hire_date"
          type="date"
          required
          defaultValue={initialData?.hire_date || ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          defaultValue={initialData?.status || "active"}
          disabled={isPending}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="status"
          value={initialData?.status || "active"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          defaultValue={initialData?.role || "member"}
          disabled={isPending}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="role"
          value={initialData?.role || "member"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="termination_date">Termination Date</Label>
        <Input
          id="termination_date"
          name="termination_date"
          type="date"
          defaultValue={initialData?.termination_date || ""}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export function UpsertEmployeeFormDialog({
  initialData,
  trigger,
  onSuccess,
  onError,
}: UpsertEmployeeFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (data: unknown) => {
    onSuccess?.(data);
    setOpen(false);
  };

  const isEditing = !!initialData?.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default">
            {isEditing ? "Edit" : "Add"} Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the employee information below."
              : "Fill in the employee details below."}
          </DialogDescription>
        </DialogHeader>
        <UpsertEmployeeForm
          initialData={initialData}
          onSuccess={handleSuccess}
          onError={onError}
        />
      </DialogContent>
    </Dialog>
  );
}

export default UpsertEmployeeForm;
