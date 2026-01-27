"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteRecords } from "./server";

interface DeleteButtonProps {
  table: string;
  ids: number[];
  revalidatePath: string;
  onSuccess?: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
}

export function DeleteButton({
  table,
  ids,
  revalidatePath: revalidatePathValue,
  onSuccess,
  variant = "destructive",
  children = "Delete",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteRecords, null);

  useEffect(() => {
    if (state?.success && !isPending) {
      toast.success(state.message);
      setOpen(false);
      onSuccess?.();
    } else if (state && !state.success && !isPending) {
      toast.error(state.message);
    }
  }, [state, isPending, onSuccess]);

  const count = ids.length;
  const recordText = count === 1 ? "record" : "records";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} disabled={count === 0}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {count} {recordText}. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
          <input type="hidden" name="ids" value={JSON.stringify(ids)} />
          <input type="hidden" name="table" value={table} />
          <input
            type="hidden"
            name="revalidatePath"
            value={revalidatePathValue}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
