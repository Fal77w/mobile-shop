import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchProducts } from "@/lib/application/services/sale-service";
import { canViewFinancials } from "@/lib/permissions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const products = await searchProducts(q);
  const showCost = canViewFinancials(session.user.role);

  const sanitized = products.map(({ costPrice, ...rest }) =>
    showCost ? { ...rest, costPrice } : rest
  );

  return NextResponse.json(sanitized);
}
