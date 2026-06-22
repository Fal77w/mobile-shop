"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { programmingOrderSchema } from "@/lib/validations";
import {
  createProgrammingOrder,
  updateProgrammingStatus,
} from "@/lib/application/services/programming-service";
import type { RepairStatus } from "@prisma/client";
import type { ActionResult } from "@/lib/domain/action-result";

export async function createProgrammingOrderAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = programmingOrderSchema.safeParse({
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      deviceType: formData.get("deviceType"),
      serviceType: formData.get("serviceType"),
      cost: formData.get("cost"),
      notes: formData.get("notes") || null,
    });
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createProgrammingOrder(user.id, parsed.data);
    revalidatePath("/programming");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateProgrammingStatusAction(
  id: string,
  status: RepairStatus
): Promise<ActionResult> {
  try {
    await requireUser();
    await updateProgrammingStatus(id, status);
    revalidatePath("/programming");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}
