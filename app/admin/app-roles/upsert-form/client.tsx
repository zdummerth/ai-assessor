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
import type { Tables } from "@/database-types";
import { upsert } from "./actions";

interface UpsertFormDialogProps {
  initialData?: Tables<"app_roles">;
  trigger?: React.ReactNode;
  onSuccess?: (data: unknown) => void;
  onError?: (message: string) => void;
}

export function UpsertForm({
  initialData,
  onSuccess,
  onError,
}: UpsertFormDialogProps) {
  const [state, formAction, isPending] = useActionState(upsert, null);

  useEffect(() => {
    if (state?.success && !isPending) {
      onSuccess?.(state.data);
      toast.success(state.message);
    } else if (state && !state.success && !isPending) {
      onError?.(state.message);
      toast.error(state.message);
    }
  }, [state, isPending, onSuccess, onError]);

  const isEditing = !!initialData?.name;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initialData?.name || ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          required
          defaultValue={initialData?.description || ""}
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

export function UpsertFormDialog({
  initialData,
  trigger,
  onSuccess,
  onError,
}: UpsertFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (data: unknown) => {
    onSuccess?.(data);
    setOpen(false);
  };

  const isEditing = !!initialData?.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default">{isEditing ? "Edit" : "Add"}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the information below."
              : "Fill in the details below."}
          </DialogDescription>
        </DialogHeader>
        <UpsertForm
          initialData={initialData}
          onSuccess={handleSuccess}
          onError={onError}
        />
      </DialogContent>
    </Dialog>
  );
}

export default UpsertForm;
