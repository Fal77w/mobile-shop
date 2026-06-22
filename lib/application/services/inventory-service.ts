import { prisma } from "@/lib/prisma";
import { InsufficientStockError, NotFoundError } from "@/lib/domain/errors";
import { logStockMovement } from "@/lib/application/services/stock-movement-service";

export async function listWarehouses() {
  return prisma.warehouse.findMany({
    include: { _count: { select: { products: true, categories: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createWarehouse(name: string) {
  return prisma.warehouse.create({ data: { name } });
}

export async function updateWarehouse(id: string, name: string) {
  return prisma.warehouse.update({ where: { id }, data: { name } });
}

export async function deleteWarehouse(id: string) {
  const count = await prisma.product.count({ where: { warehouseId: id } });
  if (count > 0) throw new Error("Cannot delete warehouse with products");
  return prisma.warehouse.delete({ where: { id } });
}

export async function listCategories(warehouseId?: string) {
  return prisma.category.findMany({
    where: warehouseId ? { warehouseId } : undefined,
    include: {
      warehouse: true,
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string, warehouseId: string, parentId?: string | null) {
  return prisma.category.create({
    data: { name, warehouseId, parentId: parentId ?? null },
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; parentId?: string | null }
) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new Error("Cannot delete category with products");
  return prisma.category.delete({ where: { id } });
}

export async function listProducts(filters?: {
  warehouseId?: string;
  categoryId?: string;
  lowStock?: boolean;
}) {
  const products = await prisma.product.findMany({
    where: {
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
    },
    include: { category: true, warehouse: true },
    orderBy: { name: "asc" },
  });
  if (filters?.lowStock) {
    return products.filter((p) => p.quantity <= p.lowStockAlert);
  }
  return products;
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    include: { category: true, warehouse: true },
    orderBy: { quantity: "asc" },
  });
  return products.filter((p) => p.quantity <= p.lowStockAlert);
}

export async function createProduct(data: {
  name: string;
  sku?: string;
  barcode?: string | null;
  categoryId: string;
  warehouseId: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockAlert: number;
}) {
  const sku = data.sku?.trim() || (await generateUniqueSku());
  return prisma.product.create({
    data: {
      ...data,
      sku,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      barcode: data.barcode ?? null,
    },
  });
}

export async function generateUniqueSku(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const sku = `SKU-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const exists = await prisma.product.findFirst({ where: { sku } });
    if (!exists) return sku;
  }
  throw new Error("Could not generate unique SKU");
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    sku: string;
    barcode: string | null;
    categoryId: string;
    warehouseId: string;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
    lowStockAlert: number;
  }>
) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function transferStock(
  userId: string,
  data: {
    fromWarehouseId: string;
    toWarehouseId: string;
    productId: string;
    quantity: number;
    notes?: string | null;
  }
) {
  if (data.fromWarehouseId === data.toWarehouseId) {
    throw new Error("Source and destination warehouses must differ");
  }

  return prisma.$transaction(async (tx) => {
    const sourceProduct = await tx.product.findUnique({
      where: { id: data.productId },
      include: { category: true },
    });
    if (!sourceProduct) throw new NotFoundError("Product");
    if (sourceProduct.warehouseId !== data.fromWarehouseId) {
      throw new Error("Product not in source warehouse");
    }
    if (sourceProduct.quantity < data.quantity) {
      throw new InsufficientStockError(
        sourceProduct.name,
        sourceProduct.quantity,
        data.quantity
      );
    }

    await tx.product.update({
      where: { id: sourceProduct.id },
      data: { quantity: { decrement: data.quantity } },
    });

    const sourceAfter = sourceProduct.quantity - data.quantity;

    let targetCategory = await tx.category.findFirst({
      where: {
        warehouseId: data.toWarehouseId,
        name: sourceProduct.category.name,
      },
    });

    if (!targetCategory) {
      targetCategory = await tx.category.create({
        data: {
          name: sourceProduct.category.name,
          warehouseId: data.toWarehouseId,
        },
      });
    }

    const existingTarget = await tx.product.findUnique({
      where: {
        warehouseId_sku: {
          warehouseId: data.toWarehouseId,
          sku: sourceProduct.sku,
        },
      },
    });

    let targetProductId: string;
    let targetBalance: number;

    if (existingTarget) {
      const updated = await tx.product.update({
        where: { id: existingTarget.id },
        data: { quantity: { increment: data.quantity } },
      });
      targetProductId = existingTarget.id;
      targetBalance = updated.quantity;
    } else {
      const created = await tx.product.create({
        data: {
          name: sourceProduct.name,
          sku: sourceProduct.sku,
          barcode: sourceProduct.barcode,
          categoryId: targetCategory.id,
          warehouseId: data.toWarehouseId,
          costPrice: sourceProduct.costPrice,
          sellingPrice: sourceProduct.sellingPrice,
          quantity: data.quantity,
          lowStockAlert: sourceProduct.lowStockAlert,
        },
      });
      targetProductId = created.id;
      targetBalance = created.quantity;
    }

    const transfer = await tx.stockTransfer.create({
      data: {
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        productId: data.productId,
        quantity: data.quantity,
        notes: data.notes ?? null,
        createdById: userId,
      },
    });

    await logStockMovement(tx, {
      productId: sourceProduct.id,
      warehouseId: data.fromWarehouseId,
      type: "TRANSFER_OUT",
      quantity: -data.quantity,
      balanceAfter: sourceAfter,
      referenceId: transfer.id,
      referenceType: "StockTransfer",
      notes: data.notes ?? null,
      createdById: userId,
    });

    await logStockMovement(tx, {
      productId: targetProductId,
      warehouseId: data.toWarehouseId,
      type: "TRANSFER_IN",
      quantity: data.quantity,
      balanceAfter: targetBalance,
      referenceId: transfer.id,
      referenceType: "StockTransfer",
      notes: data.notes ?? null,
      createdById: userId,
    });

    return transfer;
  });
}

export async function listTransfers() {
  return prisma.stockTransfer.findMany({
    include: {
      fromWarehouse: true,
      toWarehouse: true,
      product: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
