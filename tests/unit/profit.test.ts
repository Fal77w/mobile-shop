import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import {
  calculateGrossProfit,
  calculateNetProfit,
  calculateSaleItemProfit,
} from "@/lib/domain/profit";

const d = (n: number) => new Prisma.Decimal(n);

describe("profit calculations", () => {
  it("calculates sale item profit", () => {
    expect(
      calculateSaleItemProfit({
        unitPrice: d(100),
        costPriceSnapshot: d(60),
        quantity: 2,
      })
    ).toBe(80);
  });

  it("calculates gross profit from sale items", () => {
    const gross = calculateGrossProfit([
      { unitPrice: d(100), costPriceSnapshot: d(60), quantity: 2 },
      { unitPrice: d(50), costPriceSnapshot: d(30), quantity: 1 },
    ]);
    expect(gross).toBe(100);
  });

  it("calculates net profit after expenses", () => {
    expect(calculateNetProfit(1000, 200)).toBe(800);
  });
});
