"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireAccountantOrAdmin } from "@/lib/session";
import {
  purchaseSchema,
  saleReturnSchema,
  purchaseReturnSchema,
  parseJsonField,
} from "@/lib/validations";
import {
  createPurchase,
  createSaleReturn,
  createPurchaseReturn,
} from "@/lib/application/services/purchase-service";
import type { ActionResult } from "@/lib/domain/action-result";
import { DomainError } from "@/lib/domain/errors";

export async function createPurchaseAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAccountantOrAdmin();
    const items = parseJsonField(formData.get("items"), []);
    const parsed = purchaseSchema.safeParse({
      supplierName: formData.get("supplierName"),
      supplierInvoiceNo: formData.get("supplierInvoiceNo") || null,
      date: formData.get("date"),
      items,
    });
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createPurchase(user.id, {
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    revalidatePath("/purchases");
    revalidatePath("/inventory/products");
    return { success: true };
  } catch (e) {
    return { error: e instanceof DomainError ? e.message : e instanceof Error ? e.message : "Error" };
  }
}

export async function createSaleReturnAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const items = parseJsonField(formData.get("items"), []);
    const parsed = saleReturnSchema.safeParse({
      saleId: formData.get("saleId"),
      date: formData.get("date"),
      notes: formData.get("notes") || null,
      items,
    });
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createSaleReturn(user.id, {
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    revalidatePath("/returns");
    revalidatePath("/inventory/products");
    revalidatePath("/customers");
    return { success: true };
  } catch (e) {
    return { error: e instanceof DomainError ? e.message : e instanceof Error ? e.message : "Error" };
  }
}

export async function createPurchaseReturnAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const items = parseJsonField(formData.get("items"), []);
    const parsed = purchaseReturnSchema.safeParse({
      purchaseId: formData.get("purchaseId"),
      date: formData.get("date"),
      notes: formData.get("notes") || null,
      items,
    });
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createPurchaseReturn(user.id, {
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    revalidatePath("/returns");
    revalidatePath("/inventory/products");
    return { success: true };
  } catch (e) {
    return { error: e instanceof DomainError ? e.message : e instanceof Error ? e.message : "Error" };
  }
}
