import type { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export async function logStockMovement(
  tx: Tx,
  data: {
    productId: string;
    warehouseId: string;
    type: StockMovementType;
    quantity: number;
    balanceAfter: number;
    referenceId?: string | null;
    referenceType?: string | null;
    notes?: string | null;
    createdById?: string | null;
  }
) {
  return tx.stockMovement.create({ data });
}

export async function listStockMovements(filters?: {
  productId?: string;
  warehouseId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}) {
  return prisma.stockMovement.findMany({
    where: {
      ...(filters?.productId ? { productId: filters.productId } : {}),
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {}),
      ...(filters?.from || filters?.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    },
    include: {
      product: { select: { name: true, sku: true } },
      warehouse: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 200,
  });
}
