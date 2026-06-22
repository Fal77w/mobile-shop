import { prisma } from "@/lib/prisma";
import type { RepairStatus } from "@prisma/client";
import { decimal } from "@/lib/utils";

export async function listProgrammingOrders(status?: RepairStatus) {
  return prisma.programmingOrder.findMany({
    where: status ? { status } : undefined,
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function nextProgrammingNumber() {
  const count = await prisma.programmingOrder.count();
  return `PRG-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
}

export async function createProgrammingOrder(
  userId: string,
  data: {
    customerName: string;
    phone: string;
    deviceType: string;
    serviceType: string;
    cost: number;
    notes?: string | null;
  }
) {
  return prisma.programmingOrder.create({
    data: {
      orderNumber: await nextProgrammingNumber(),
      customerName: data.customerName,
      phone: data.phone,
      deviceType: data.deviceType,
      serviceType: data.serviceType,
      cost: decimal(data.cost),
      notes: data.notes ?? null,
      createdById: userId,
    },
  });
}

export async function updateProgrammingStatus(id: string, status: RepairStatus) {
  return prisma.programmingOrder.update({
    where: { id },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
    },
  });
}
