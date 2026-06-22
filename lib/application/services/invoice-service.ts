import { prisma } from "@/lib/prisma";

export async function getNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const settings = await prisma.shopSettings.findUnique({ where: { id: "default" } });
  const prefix = settings?.invoicePrefix ?? "INV";

  const seq = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceSequence.findUnique({ where: { year } });
    if (existing) {
      return tx.invoiceSequence.update({
        where: { year },
        data: { lastNumber: { increment: 1 } },
      });
    }
    return tx.invoiceSequence.create({
      data: { year, lastNumber: 1 },
    });
  });

  const num = String(seq.lastNumber).padStart(5, "0");
  return `${prefix}-${year}-${num}`;
}

export async function getShopSettings() {
  return prisma.shopSettings.findUnique({ where: { id: "default" } });
}

export async function getInvoiceData(saleId: string) {
  const [settings, sale] = await Promise.all([
    getShopSettings(),
    prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true, customer: true },
    }),
  ]);

  if (!sale) return null;

  return { settings, sale };
}
