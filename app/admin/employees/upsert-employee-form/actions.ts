"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types";

export async function upsertEmployee(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const idString = formData.get("id") as string;
  const id = idString ? parseInt(idString) : undefined;

  const employeeData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: (formData.get("email") as string) || null,
    hire_date: formData.get("hire_date") as string,
    user_id: (formData.get("user_id") as string) || null,
    status: (formData.get("status") as string) || "active",
    role: (formData.get("role") as string) || "member",
    termination_date: (formData.get("termination_date") as string) || null,
  };

  // Use update when id exists, insert when creating new
  const { data, error } = id
    ? await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", id)
        .select()
        .single()
    : await supabase.from("employees").insert([employeeData]).select().single();
  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/employees");

  const message = id
    ? "Employee updated successfully"
    : "Employee created successfully";

  return { success: true, message, data };
}
