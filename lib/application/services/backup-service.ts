import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

const BACKUP_VERSION = 1;

export async function exportBackup() {
  const [
    shopSettings,
    users,
    warehouses,
    categories,
    products,
    customers,
    sales,
    purchases,
    expenses,
    payments,
    saleReturns,
    purchaseReturns,
    stockTransfers,
    stockMovements,
    repairOrders,
    invoiceSequences,
  ] = await Promise.all([
    prisma.shopSettings.findMany(),
    prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true } }),
    prisma.warehouse.findMany(),
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.customer.findMany(),
    prisma.sale.findMany({ include: { items: true } }),
    prisma.purchase.findMany({ include: { items: true } }),
    prisma.expense.findMany(),
    prisma.payment.findMany(),
    prisma.saleReturn.findMany({ include: { items: true } }),
    prisma.purchaseReturn.findMany({ include: { items: true } }),
    prisma.stockTransfer.findMany(),
    prisma.stockMovement.findMany(),
    prisma.repairOrder.findMany(),
    prisma.invoiceSequence.findMany(),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: "moblies-shop",
    data: {
      shopSettings,
      users,
      warehouses,
      categories,
      products,
      customers,
      sales,
      purchases,
      expenses,
      payments,
      saleReturns,
      purchaseReturns,
      stockTransfers,
      stockMovements,
      repairOrders,
      invoiceSequences,
    },
  };
}

export async function restoreBackup(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new Error("Invalid backup format");
  }
  const data = (payload as { data: Record<string, unknown[]> }).data;

  await prisma.$transaction(async (tx) => {
    await tx.saleReturnItem.deleteMany();
    await tx.saleReturn.deleteMany();
    await tx.purchaseReturnItem.deleteMany();
    await tx.purchaseReturn.deleteMany();
    await tx.saleItem.deleteMany();
    await tx.sale.deleteMany();
    await tx.purchaseItem.deleteMany();
    await tx.purchase.deleteMany();
    await tx.payment.deleteMany();
    await tx.expense.deleteMany();
    await tx.stockMovement.deleteMany();
    await tx.stockTransfer.deleteMany();
    await tx.repairOrder.deleteMany();
    await tx.product.deleteMany();
    await tx.customer.deleteMany();
    await tx.invoiceSequence.deleteMany();

    for (const row of data.shopSettings ?? []) await tx.shopSettings.upsert({ where: { id: (row as { id: string }).id }, create: row as never, update: row as never });
    for (const row of data.warehouses ?? []) await tx.warehouse.upsert({ where: { id: (row as { id: string }).id }, create: row as never, update: row as never });
    for (const row of data.categories ?? []) await tx.category.upsert({ where: { id: (row as { id: string }).id }, create: row as never, update: row as never });
    for (const row of data.products ?? []) await tx.product.create({ data: row as never });
    for (const row of data.customers ?? []) await tx.customer.create({ data: row as never });
    for (const row of data.expenses ?? []) await tx.expense.create({ data: row as never });
    for (const row of data.invoiceSequences ?? []) await tx.invoiceSequence.create({ data: row as never });

    for (const row of data.purchases ?? []) {
      const { items, ...purchase } = row as { items: unknown[]; id: string };
      await tx.purchase.create({ data: { ...(purchase as object), items: { create: items as never[] } } as never });
    }
    for (const row of data.sales ?? []) {
      const { items, ...sale } = row as { items: unknown[]; id: string };
      await tx.sale.create({ data: { ...(sale as object), items: { create: items as never[] } } as never });
    }
    for (const row of data.payments ?? []) await tx.payment.create({ data: row as never });
    for (const row of data.stockTransfers ?? []) await tx.stockTransfer.create({ data: row as never });
    for (const row of data.stockMovements ?? []) await tx.stockMovement.create({ data: row as never });
    for (const row of data.repairOrders ?? []) await tx.repairOrder.create({ data: row as never });
  });
}

export function getInventoryValuation() {
  return prisma.product.findMany({
    include: { warehouse: true, category: true },
    orderBy: { name: "asc" },
  }).then((products) => {
    const rows = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      warehouse: p.warehouse.name,
      category: p.category.name,
      quantity: p.quantity,
      costPrice: toNumber(p.costPrice),
      sellingPrice: toNumber(p.sellingPrice),
      costValue: toNumber(p.costPrice) * p.quantity,
      retailValue: toNumber(p.sellingPrice) * p.quantity,
    }));
    const totalCost = rows.reduce((s, r) => s + r.costValue, 0);
    const totalRetail = rows.reduce((s, r) => s + r.retailValue, 0);
    return { rows, totalCost, totalRetail };
  });
}
