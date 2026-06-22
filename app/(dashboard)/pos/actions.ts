"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import {
  completeSaleSchema,
  parseJsonField,
} from "@/lib/validations";
import { completeSale, searchProducts } from "@/lib/application/services/sale-service";
import type { ActionResult } from "@/lib/domain/action-result";
import { DomainError } from "@/lib/domain/errors";

export async function searchProductsAction(query: string) {
  await requireUser();
  return searchProducts(query);
}

export async function completeSaleAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const items = parseJsonField<Array<{ productId: string; quantity: number }>>(
      formData.get("items"),
      []
    );
    const parsed = completeSaleSchema.safeParse({
      items,
      paymentMethod: formData.get("paymentMethod"),
      customerId: formData.get("customerId") || null,
      customerName: formData.get("customerName") || null,
    });
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Invalid data" };
    }
    const sale = await completeSale(user.id, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/inventory/products");
    revalidatePath("/customers");
    return { success: true, id: sale.id };
  } catch (e) {
    return { error: e instanceof DomainError ? e.message : e instanceof Error ? e.message : "Error" };
  }
}
