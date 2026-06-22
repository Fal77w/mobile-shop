import { prisma } from "@/lib/prisma";
import { InsufficientStockError, NotFoundError } from "@/lib/domain/errors";
import { logStockMovement } from "@/lib/application/services/stock-movement-service";
import type { PaymentMethod } from "@prisma/client";
import { decimal } from "@/lib/utils";

type CartItem = { productId: string; quantity: number };

export async function completeSale(
  userId: string,
  data: {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    customerId?: string | null;
    customerName?: string | null;
  }
) {
  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new NotFoundError("Product");
      if (product.quantity < item.quantity) {
        throw new InsufficientStockError(product.name, product.quantity, item.quantity);
      }
      subtotal += Number(product.sellingPrice) * item.quantity;
    }

    if (data.paymentMethod === "ON_ACCOUNT" && !data.customerId) {
      throw new Error("Customer required for on-account sales");
    }

    const invoiceNumber = await getNextInvoiceNumberInTx(tx);
    const total = subtotal;

    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId: data.customerId ?? null,
        customerName: data.customerName ?? null,
        paymentMethod: data.paymentMethod,
        subtotal: decimal(subtotal),
        total: decimal(total),
        createdById: userId,
        items: {
          create: data.items.map((item) => {
            const product = productMap.get(item.productId)!;
            const lineTotal = Number(product.sellingPrice) * item.quantity;
            return {
              productId: product.id,
              productName: product.name,
              quantity: item.quantity,
              unitPrice: decimal(Number(product.sellingPrice)),
              costPriceSnapshot: decimal(Number(product.costPrice)),
              lineTotal: decimal(lineTotal),
            };
          }),
        },
      },
    });

    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
      await logStockMovement(tx, {
        productId: item.productId,
        warehouseId: product.warehouseId,
        type: "SALE",
        quantity: -item.quantity,
        balanceAfter: updated.quantity,
        referenceId: sale.id,
        referenceType: "Sale",
        createdById: userId,
      });
    }

    if (data.paymentMethod === "ON_ACCOUNT" && data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { totalDebt: { increment: total } },
      });
    }

    return sale;
  });
}

async function getNextInvoiceNumberInTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const year = new Date().getFullYear();
  const settings = await tx.shopSettings.findUnique({ where: { id: "default" } });
  const prefix = settings?.invoicePrefix ?? "INV";

  const existing = await tx.invoiceSequence.findUnique({ where: { year } });
  const seq = existing
    ? await tx.invoiceSequence.update({
        where: { year },
        data: { lastNumber: { increment: 1 } },
      })
    : await tx.invoiceSequence.create({ data: { year, lastNumber: 1 } });

  const num = String(seq.lastNumber).padStart(5, "0");
  return `${prefix}-${year}-${num}`;
}

export async function searchProducts(query: string, limit = 20) {
  if (!query.trim()) return [];
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query, mode: "insensitive" } },
      ],
      quantity: { gt: 0 },
    },
    include: { category: true, warehouse: true },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function listPosProducts(categoryName?: string) {
  return prisma.product.findMany({
    where: {
      quantity: { gt: 0 },
      ...(categoryName ? { category: { name: categoryName } } : {}),
    },
    include: { category: true, warehouse: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
}

export async function listSales(options?: { from?: Date; to?: Date }) {
  return prisma.sale.findMany({
    where: {
      ...(options?.from || options?.to
        ? {
            createdAt: {
              ...(options.from ? { gte: options.from } : {}),
              ...(options.to ? { lte: options.to } : {}),
            },
          }
        : {}),
    },
    include: {
      customer: true,
      createdBy: { select: { name: true } },
      items: { orderBy: { productName: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSalesSummary(from: Date, to: Date) {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { total: true, paymentMethod: true },
  });
  const total = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const cash = sales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((sum, s) => sum + Number(s.total), 0);
  const card = sales
    .filter((s) => s.paymentMethod === "CARD")
    .reduce((sum, s) => sum + Number(s.total), 0);
  const onAccount = sales
    .filter((s) => s.paymentMethod === "ON_ACCOUNT")
    .reduce((sum, s) => sum + Number(s.total), 0);
  return { count: sales.length, total, cash, card, onAccount };
}

export async function getSale(id: string) {
  return prisma.sale.findUnique({
    where: { id },
    include: { items: true, customer: true, createdBy: { select: { name: true } } },
  });
}
