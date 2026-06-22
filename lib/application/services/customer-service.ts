import { prisma } from "@/lib/prisma";
import { decimal, toNumber } from "@/lib/utils";
import { calculateGrossProfit, calculateNetProfit } from "@/lib/domain/profit";

export async function listCustomers() {
  return prisma.customer.findMany({ orderBy: { name: "asc" } });
}

export async function createCustomer(data: { name: string; phone?: string | null }) {
  return prisma.customer.create({
    data: { name: data.name, phone: data.phone ?? null },
  });
}

export async function updateCustomer(
  id: string,
  data: { name: string; phone?: string | null }
) {
  return prisma.customer.update({
    where: { id },
    data: { name: data.name, phone: data.phone ?? null },
  });
}

export async function deleteCustomer(id: string) {
  const debt = await prisma.customer.findUnique({ where: { id } });
  if (debt && toNumber(debt.totalDebt) > 0) {
    throw new Error("Cannot delete customer with outstanding debt");
  }
  return prisma.customer.delete({ where: { id } });
}

export async function recordPayment(data: {
  customerId: string;
  amount: number;
  date: Date;
  notes?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error("Customer not found");
    if (toNumber(customer.totalDebt) < data.amount) {
      throw new Error("Payment exceeds customer debt");
    }

    const payment = await tx.payment.create({
      data: {
        customerId: data.customerId,
        amount: decimal(data.amount),
        date: data.date,
        notes: data.notes ?? null,
      },
    });

    await tx.customer.update({
      where: { id: data.customerId },
      data: { totalDebt: { decrement: data.amount } },
    });

    return payment;
  });
}

export async function getCustomerReport(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      sales: { include: { items: true }, orderBy: { createdAt: "desc" } },
      payments: { orderBy: { date: "desc" } },
    },
  });
  if (!customer) return null;

  const totalPurchases = customer.sales.reduce(
    (sum, s) => sum + toNumber(s.total),
    0
  );
  const totalPaid = customer.payments.reduce(
    (sum, p) => sum + toNumber(p.amount),
    0
  );

  return {
    customer,
    totalPurchases,
    totalPaid,
    remaining: toNumber(customer.totalDebt),
  };
}

export async function createExpense(data: {
  title: string;
  amount: number;
  date: Date;
  notes?: string | null;
}) {
  return prisma.expense.create({
    data: {
      title: data.title,
      amount: decimal(data.amount),
      date: data.date,
      notes: data.notes ?? null,
    },
  });
}

export async function updateExpense(
  id: string,
  data: { title: string; amount: number; date: Date; notes?: string | null }
) {
  return prisma.expense.update({
    where: { id },
    data: {
      title: data.title,
      amount: decimal(data.amount),
      date: data.date,
      notes: data.notes ?? null,
    },
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({ where: { id } });
}

export async function listExpenses(from?: Date, to?: Date) {
  return prisma.expense.findMany({
    where: {
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
  });
}
