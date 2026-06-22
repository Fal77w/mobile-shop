"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { userSchema, parseFormData } from "@/lib/validations";
import { createUser, deleteUser } from "@/lib/application/services/user-service";
import type { ActionResult } from "@/lib/domain/action-result";

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = parseFormData(userSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createUser(parsed.data);
    revalidatePath("/users");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await deleteUser(id, admin.id);
    revalidatePath("/users");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}
