import { prisma } from "@/lib/prisma";
import { InsufficientStockError, NotFoundError } from "@/lib/domain/errors";
import { logStockMovement } from "@/lib/application/services/stock-movement-service";
import { decimal } from "@/lib/utils";

export async function createPurchase(
  userId: string,
  data: {
    supplierName: string;
    supplierInvoiceNo?: string | null;
    date: Date;
    items: { productId: string; quantity: number; costPrice: number }[];
  }
) {
  return prisma.$transaction(async (tx) => {
    let total = 0;
    const lineItems = [];

    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundError("Product");
      const lineTotal = item.costPrice * item.quantity;
      total += lineTotal;
      lineItems.push({ product, item, lineTotal });
    }

    const purchase = await tx.purchase.create({
      data: {
        supplierName: data.supplierName,
        supplierInvoiceNo: data.supplierInvoiceNo ?? null,
        date: data.date,
        total: decimal(total),
        createdById: userId,
        items: {
          create: lineItems.map(({ product, item, lineTotal }) => ({
            productId: product.id,
            quantity: item.quantity,
            costPrice: decimal(item.costPrice),
            lineTotal: decimal(lineTotal),
          })),
        },
      },
    });

    for (const { product, item } of lineItems) {
      await tx.product.update({
        where: { id: product.id },
        data: {
          quantity: { increment: item.quantity },
          costPrice: decimal(item.costPrice),
        },
      });
    }

    return purchase;
  });
}

export async function listPurchases() {
  return prisma.purchase.findMany({
    include: {
      items: { include: { product: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getPurchase(id: string) {
  return prisma.purchase.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
}

export async function createSaleReturn(
  userId: string,
  data: {
    saleId: string;
    date: Date;
    notes?: string | null;
    items: { productId: string; quantity: number; refundAmount: number }[];
  }
) {
  return prisma.$transaction(async (tx) => {
    let totalRefund = 0;
    const lineItems = [];

    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundError("Product");
      totalRefund += item.refundAmount;
      lineItems.push({ product, item });
    }

    const saleReturn = await tx.saleReturn.create({
      data: {
        saleId: data.saleId,
        date: data.date,
        totalRefund: decimal(totalRefund),
        notes: data.notes ?? null,
        createdById: userId,
        items: {
          create: lineItems.map(({ product, item }) => ({
            productId: product.id,
            quantity: item.quantity,
            refundAmount: decimal(item.refundAmount),
            costSnapshot: decimal(Number(product.costPrice)),
          })),
        },
      },
    });

    for (const { product, item } of lineItems) {
      const updated = await tx.product.update({
        where: { id: product.id },
        data: { quantity: { increment: item.quantity } },
      });
      await logStockMovement(tx, {
        productId: product.id,
        warehouseId: product.warehouseId,
        type: "SALE_RETURN",
        quantity: item.quantity,
        balanceAfter: updated.quantity,
        referenceId: saleReturn.id,
        referenceType: "SaleReturn",
        createdById: userId,
      });
    }

    if (data.saleId) {
      const sale = await tx.sale.findUnique({ where: { id: data.saleId } });
      if (sale?.paymentMethod === "ON_ACCOUNT" && sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: { totalDebt: { decrement: totalRefund } },
        });
      }
    }

    return saleReturn;
  });
}

export async function createPurchaseReturn(
  userId: string,
  data: {
    purchaseId: string;
    date: Date;
    notes?: string | null;
    items: { productId: string; quantity: number }[];
  }
) {
  return prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new NotFoundError("Product");
      if (product.quantity < item.quantity) {
        throw new InsufficientStockError(product.name, product.quantity, item.quantity);
      }
    }

    const purchaseReturn = await tx.purchaseReturn.create({
      data: {
        purchaseId: data.purchaseId,
        date: data.date,
        notes: data.notes ?? null,
        createdById: userId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
      await logStockMovement(tx, {
        productId: item.productId,
        warehouseId: product.warehouseId,
        type: "PURCHASE_RETURN",
        quantity: -item.quantity,
        balanceAfter: updated.quantity,
        referenceId: purchaseReturn.id,
        referenceType: "PurchaseReturn",
        createdById: userId,
      });
    }

    return purchaseReturn;
  });
}

export async function listSaleReturns() {
  return prisma.saleReturn.findMany({
    include: { items: { include: { product: true } }, sale: true },
    orderBy: { date: "desc" },
  });
}

export async function listPurchaseReturns() {
  return prisma.purchaseReturn.findMany({
    include: { items: { include: { product: true } }, purchase: true },
    orderBy: { date: "desc" },
  });
}
