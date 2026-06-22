import { PageHeader } from "@/components/layout/page-header";
import { listProducts } from "@/lib/application/services/inventory-service";
import { listSales } from "@/lib/application/services/sale-service";
import { listPurchases } from "@/lib/application/services/purchase-service";
import { requireUser } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { ReturnsClient } from "./returns-client";

export default async function ReturnsPage() {
  const user = await requireUser();
  const t = await getTranslator(user.locale, "returns");

  const [products, sales, purchases] = await Promise.all([
    listProducts(),
    listSales(),
    listPurchases(),
  ]);

  return (
    <div>
      <PageHeader title={t("title")} />
      <ReturnsClient
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        sales={sales.map((s) => ({ id: s.id, invoiceNumber: s.invoiceNumber }))}
        purchases={purchases.map((p) => ({ id: p.id, supplierName: p.supplierName }))}
      />
    </div>
  );
}
