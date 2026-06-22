import { prisma } from "@/lib/prisma";
import type { RepairStatus } from "@prisma/client";
import { decimal } from "@/lib/utils";

export async function listRepairOrders(status?: RepairStatus) {
  return prisma.repairOrder.findMany({
    where: status ? { status } : undefined,
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRepairOrder(id: string) {
  return prisma.repairOrder.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true } } },
  });
}

async function nextRepairNumber() {
  const count = await prisma.repairOrder.count();
  return `REP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
}

export async function createRepairOrder(
  userId: string,
  data: {
    customerName: string;
    phone: string;
    deviceType: string;
    issue: string;
    cost: number;
    notes?: string | null;
  }
) {
  return prisma.repairOrder.create({
    data: {
      orderNumber: await nextRepairNumber(),
      customerName: data.customerName,
      phone: data.phone,
      deviceType: data.deviceType,
      issue: data.issue,
      cost: decimal(data.cost),
      notes: data.notes ?? null,
      createdById: userId,
    },
  });
}

export async function updateRepairStatus(id: string, status: RepairStatus) {
  return prisma.repairOrder.update({
    where: { id },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
    },
  });
}

export async function getRepairReport(from?: Date, to?: Date) {
  const where = {
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };

  const orders = await prisma.repairOrder.findMany({ where, orderBy: { createdAt: "desc" } });
  const totalIncome = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.cost), 0);

  const issueMap = new Map<string, number>();
  for (const o of orders) {
    const key = o.issue.slice(0, 50);
    issueMap.set(key, (issueMap.get(key) ?? 0) + 1);
  }

  const commonIssues = Array.from(issueMap.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { orders, totalIncome, commonIssues };
}

export async function getProgrammingIncomeReport(from?: Date, to?: Date) {
  const programmingProducts = await prisma.product.findMany({
    where: { category: { name: { in: ["برمجة", "Programming"] } } },
    select: { id: true, name: true },
  });
  const ids = programmingProducts.map((p) => p.id);
  if (ids.length === 0) return { items: [], total: 0 };

  const items = await prisma.saleItem.findMany({
    where: {
      productId: { in: ids },
      sale: {
        createdAt: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      },
    },
    include: { sale: { select: { invoiceNumber: true, createdAt: true } } },
  });

  const total = items.reduce((sum, i) => sum + Number(i.lineTotal), 0);
  return { items, total };
}
