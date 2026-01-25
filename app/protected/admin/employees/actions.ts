"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function createEmployee(formData: {
  first_name: string;
  last_name: string;
  email?: string;
  hire_date: string;
  user_id?: string;
  status?: string;
  role?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .insert([
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        hire_date: formData.hire_date,
        user_id: formData.user_id || null,
        status: formData.status || "active",
        role: formData.role || "member",
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateEmployee(
  id: number,
  updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    hire_date?: string;
    termination_date?: string;
    status?: string;
    role?: string;
  },
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteEmployee(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function hasAdminRole() {
  const supabase = await createClient();
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user.user) {
    return false;
  }

  const { data: employee, error: empError } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user.user.id)
    .single();

  if (empError || !employee) {
    return false;
  }

  const { data: roles, error: roleError } = await supabase
    .from("employee_roles")
    .select("role")
    .eq("employee_id", employee.id)
    .eq("role", "admin");

  return !roleError && roles && roles.length > 0;
}
