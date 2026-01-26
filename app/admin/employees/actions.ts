"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEmployees(limit = 20, offset = 0) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error, count: data?.length || 0 };
}

export async function getEmployeeById(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export type ActionState = {
  success: boolean;
  message: string;
  data?: unknown;
};

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

  revalidatePath("/protected/admin/employees");

  const message = id
    ? "Employee updated successfully"
    : "Employee created successfully";

  return { success: true, message, data };
}

export async function deleteEmployees(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const idsString = formData.get("ids") as string;
  const ids = JSON.parse(idsString);

  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, message: "No employees selected" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().in("id", ids);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/protected/admin/employees");

  const count = ids.length;
  return {
    success: true,
    message: `${count} employee${count > 1 ? "s" : ""} deleted successfully`,
  };
}
