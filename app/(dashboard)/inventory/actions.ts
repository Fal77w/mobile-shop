"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { canEditCostPrice } from "@/lib/permissions";
import {
  warehouseSchema,
  categorySchema,
  productSchema,
  stockTransferSchema,
  parseFormData,
} from "@/lib/validations";
import {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  transferStock,
} from "@/lib/application/services/inventory-service";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/domain/action-result";

export async function createWarehouseAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(warehouseSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createWarehouse(parsed.data.name);
    revalidatePath("/inventory/warehouses");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateWarehouseAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(warehouseSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await updateWarehouse(id, parsed.data.name);
    revalidatePath("/inventory/warehouses");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteWarehouseAction(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await deleteWarehouse(id);
    revalidatePath("/inventory/warehouses");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(categorySchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await createCategory(
      parsed.data.name,
      parsed.data.warehouseId,
      parsed.data.parentId && parsed.data.parentId !== "none" ? parsed.data.parentId : null
    );
    revalidatePath("/inventory/categories");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFormData(categorySchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await updateCategory(id, {
      name: parsed.data.name,
      parentId:
        parsed.data.parentId && parsed.data.parentId !== "none"
          ? parsed.data.parentId
          : null,
    });
    revalidatePath("/inventory/categories");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await deleteCategory(id);
    revalidatePath("/inventory/categories");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = parseFormData(productSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    const costPrice = canEditCostPrice(user.role) ? parsed.data.costPrice : 0;
    await createProduct({
      ...parsed.data,
      sku: parsed.data.sku?.trim() || undefined,
      costPrice,
      barcode: parsed.data.barcode ?? null,
    });
    revalidatePath("/inventory/products");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateProductAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = parseFormData(productSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    const updateData: Parameters<typeof updateProduct>[1] = {
      name: parsed.data.name,
      barcode: parsed.data.barcode ?? null,
      categoryId: parsed.data.categoryId,
      warehouseId: parsed.data.warehouseId,
      sellingPrice: parsed.data.sellingPrice,
      quantity: parsed.data.quantity,
      lowStockAlert: parsed.data.lowStockAlert,
      ...(parsed.data.sku ? { sku: parsed.data.sku } : {}),
    };
    if (!canEditCostPrice(user.role)) {
      const existing = await prisma.product.findUnique({ where: { id }, select: { costPrice: true } });
      updateData.costPrice = existing ? Number(existing.costPrice) : 0;
    }
    await updateProduct(id, updateData);
    revalidatePath("/inventory/products");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await deleteProduct(id);
    revalidatePath("/inventory/products");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}

export async function transferStockAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = parseFormData(stockTransferSchema, formData);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid" };
    await transferStock(user.id, parsed.data);
    revalidatePath("/inventory/transfers");
    revalidatePath("/inventory/products");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}
