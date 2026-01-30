"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types";

export async function assignPermissions(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const appRoleName = formData.get("role") as string;
  const permissionsString = formData.get("permissions") as string;

  if (!permissionsString) {
    return {
      success: false,
      message: "No permissions provided",
    };
  }
  //split on commas
  const permissionsArray = permissionsString.split(",");
  console.log("Assigning permissions:", appRoleName, permissionsArray);

  if (!appRoleName || permissionsArray?.length === 0) {
    return {
      success: false,
      message: "Role and permissions are required",
    };
  }

  try {
    // Delete existing permissions for this role
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role", appRoleName);

    if (deleteError) {
      console.error("Error deleting existing permissions:", deleteError);
      return { success: false, message: deleteError.message };
    }

    // Insert new permissions
    const permissionRecords = permissionsArray.map((permission: string) => ({
      role: appRoleName,
      permission: permission,
    }));

    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(permissionRecords);

    if (insertError) {
      console.error("Error inserting new permissions:", insertError);
      return { success: false, message: insertError.message };
    }

    revalidatePath("/admin/role-permission");
    revalidatePath("/admin/app-roles");

    return {
      success: true,
      message: "Permissions assigned successfully",
      data: permissionRecords,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
