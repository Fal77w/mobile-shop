import { prisma } from "@/lib/prisma";
import { calculateGrossProfit, calculateNetProfit } from "@/lib/domain/profit";
import { toNumber } from "@/lib/utils";
import { getLowStockProducts } from "@/lib/application/services/inventory-service";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getDailySalesReport(date: Date) {
  const from = startOfDay(date);
  const to = endOfDay(date);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true },
  });

  const totalSales = sales.reduce((sum, s) => sum + toNumber(s.total), 0);
  const count = sales.length;
  const grossProfit = calculateGrossProfit(
    sales.flatMap((s) => s.items),
    []
  );

  return { sales, totalSales, count, grossProfit, date };
}

export async function getMonthlySalesReport(date: Date) {
  const from = startOfMonth(date);
  const to = endOfMonth(date);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true },
  });

  const totalSales = sales.reduce((sum, s) => sum + toNumber(s.total), 0);
  const count = sales.length;

  const byDay = new Map<string, number>();
  for (const sale of sales) {
    const key = sale.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + toNumber(sale.total));
  }

  return {
    sales,
    totalSales,
    count,
    byDay: Array.from(byDay.entries()).map(([date, total]) => ({ date, total })),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export async function getProfitReport(from?: Date, to?: Date) {
  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const saleItems = await prisma.saleItem.findMany({
    where: { sale: dateFilter },
    include: { product: { include: { warehouse: true, category: true } } },
  });

  const returnItems = await prisma.saleReturnItem.findMany({
    where: {
      saleReturn: {
        date: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      },
    },
    include: { product: { include: { warehouse: true, category: true } } },
  });

  const grossProfit = calculateGrossProfit(saleItems, returnItems);

  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    },
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
  const netProfit = calculateNetProfit(grossProfit, totalExpenses);

  const byWarehouse = new Map<string, { name: string; profit: number }>();
  const byCategory = new Map<string, { name: string; profit: number }>();

  for (const item of saleItems) {
    const wh = item.product.warehouse;
    const cat = item.product.category;
    const profit =
      (toNumber(item.unitPrice) - toNumber(item.costPriceSnapshot)) * item.quantity;

    const whEntry = byWarehouse.get(wh.id) ?? { name: wh.name, profit: 0 };
    whEntry.profit += profit;
    byWarehouse.set(wh.id, whEntry);

    const catEntry = byCategory.get(cat.id) ?? { name: cat.name, profit: 0 };
    catEntry.profit += profit;
    byCategory.set(cat.id, catEntry);
  }

  for (const item of returnItems) {
    const wh = item.product.warehouse;
    const cat = item.product.category;
    const unitRefund = toNumber(item.refundAmount) / item.quantity;
    const loss =
      (unitRefund - toNumber(item.costSnapshot)) * item.quantity;

    const whEntry = byWarehouse.get(wh.id) ?? { name: wh.name, profit: 0 };
    whEntry.profit -= loss;
    byWarehouse.set(wh.id, whEntry);

    const catEntry = byCategory.get(cat.id) ?? { name: cat.name, profit: 0 };
    catEntry.profit -= loss;
    byCategory.set(cat.id, catEntry);
  }

  return {
    grossProfit,
    netProfit,
    totalExpenses,
    byWarehouse: Array.from(byWarehouse.values()),
    byCategory: Array.from(byCategory.values()),
  };
}

export async function getDebtReport() {
  const customers = await prisma.customer.findMany({
    where: { totalDebt: { gt: 0 } },
    orderBy: { totalDebt: "desc" },
  });
  const totalDebt = customers.reduce((sum, c) => sum + toNumber(c.totalDebt), 0);
  return { customers, totalDebt };
}

export async function getExpenseReport(from?: Date, to?: Date) {
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    },
    orderBy: { date: "desc" },
  });
  const total = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
  return { expenses, total };
}

export async function getLowStockReport() {
  return getLowStockProducts();
}

export async function getDashboardStats(includeFinancials = true) {
  const today = new Date();
  const from = startOfDay(today);
  const to = endOfDay(today);

  const [dailySales, lowStock, debtReport, profitToday] = await Promise.all([
    getDailySalesReport(today),
    getLowStockProducts(),
    getDebtReport(),
    includeFinancials ? getProfitReport(from, to) : Promise.resolve({ grossProfit: 0 }),
  ]);

  const recentSales = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return {
    todaySales: dailySales.totalSales,
    todaySalesCount: dailySales.count,
    todayGrossProfit: includeFinancials ? profitToday.grossProfit : null,
    lowStockCount: lowStock.length,
    totalDebt: debtReport.totalDebt,
    recentSales,
    lowStock,
  };
}

export async function getSalesReport(from: Date, to: Date) {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
  const totalSales = sales.reduce((sum, s) => sum + toNumber(s.total), 0);
  const grossProfit = calculateGrossProfit(sales.flatMap((s) => s.items), []);
  return { sales, totalSales, count: sales.length, grossProfit };
}

export async function getProfitByItemReport(from?: Date, to?: Date) {
  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const items = await prisma.saleItem.findMany({
    where: { sale: dateFilter },
    include: { product: true },
  });

  const map = new Map<
    string,
    { name: string; quantity: number; revenue: number; cost: number; profit: number }
  >();

  for (const item of items) {
    const key = item.productId;
    const entry = map.get(key) ?? {
      name: item.productName,
      quantity: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
    };
    const revenue = toNumber(item.lineTotal);
    const cost = toNumber(item.costPriceSnapshot) * item.quantity;
    entry.quantity += item.quantity;
    entry.revenue += revenue;
    entry.cost += cost;
    entry.profit += revenue - cost;
    map.set(key, entry);
  }

  return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
}
