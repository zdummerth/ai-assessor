"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types";

export async function upsert(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const idString = formData.get("id") as string;
  const id = idString ? parseInt(idString) : undefined;

  const args = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  // Use update when id exists, insert when creating new
  const { data, error } = id
    ? await supabase
        .from("app_roles")
        .update(args)
        .eq("id", id)
        .select()
        .single()
    : await supabase.from("app_roles").insert(args).select().single();
  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/app_roles");

  const message = id
    ? "Role updated successfully"
    : "Role created successfully";

  return { success: true, message, data };
}
