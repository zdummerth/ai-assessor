"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types";

export async function deleteRecords(
  _prevState: ActionState | null,
  _formData: FormData,
): Promise<ActionState> {
  const idsString = _formData.get("ids") as string;
  const ids = JSON.parse(idsString);
  const revalidatePathValue = _formData.get("revalidatePath") as string;
  const table = _formData.get("table") as string;
  const idColumn = (_formData.get("idColumn") as string) || "id";

  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, message: "No records selected" };
  }

  const supabase = await createClient();
  //@ts-expect-error dynamic table name, but not returning data
  const { error } = await supabase.from(table).delete().in(idColumn, ids);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(revalidatePathValue);

  const count = ids.length;
  return {
    success: true,
    message: `${count} record${count > 1 ? "s" : ""} deleted successfully`,
  };
}
