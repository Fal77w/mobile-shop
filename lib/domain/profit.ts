import type { SaleReturnItem, SaleItem } from "@prisma/client";
import { toNumber } from "@/lib/utils";

type SaleItemLike = Pick<SaleItem, "unitPrice" | "costPriceSnapshot" | "quantity">;
type SaleReturnItemLike = Pick<SaleReturnItem, "refundAmount" | "costSnapshot" | "quantity">;

export function calculateSaleItemProfit(item: SaleItemLike): number {
  const margin = toNumber(item.unitPrice) - toNumber(item.costPriceSnapshot);
  return margin * item.quantity;
}

export function calculateSaleReturnProfitLoss(item: SaleReturnItemLike): number {
  const unitRefund = toNumber(item.refundAmount) / item.quantity;
  const margin = unitRefund - toNumber(item.costSnapshot);
  return margin * item.quantity;
}

export function calculateGrossProfit(
  saleItems: SaleItemLike[],
  returnItems: SaleReturnItemLike[] = []
): number {
  const salesProfit = saleItems.reduce((sum, item) => sum + calculateSaleItemProfit(item), 0);
  const returnLoss = returnItems.reduce(
    (sum, item) => sum + calculateSaleReturnProfitLoss(item),
    0
  );
  return salesProfit - returnLoss;
}

export function calculateNetProfit(grossProfit: number, totalExpenses: number): number {
  return grossProfit - totalExpenses;
}
