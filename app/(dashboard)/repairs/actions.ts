"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { repairOrderSchema } from "@/lib/validations";
import {
  createRepairOrder,
  updateRepairStatus,
} from "@/lib/application/services/repair-service";
import type { RepairStatus } from "@prisma/client";
import type { ActionResult } from "@/lib/domain/action-result";

export async function createRepairOrderAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = repairOrderSchema.safeParse({
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      deviceType: formData.get("deviceType"),
      issue: formData.get("issue"),
      cost: formData.get("cost"),
      notes: formData.get("notes") || null,
    });
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createRepairOrder(user.id, parsed.data);
    revalidatePath("/repairs");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateRepairStatusAction(
  id: string,
  status: RepairStatus
): Promise<ActionResult> {
  try {
    await requireUser();
    await updateRepairStatus(id, status);
    revalidatePath("/repairs");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}
