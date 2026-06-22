import { PosClient } from "./pos-client";
import { listCustomers } from "@/lib/application/services/customer-service";
import { listPosProducts } from "@/lib/application/services/sale-service";
import { requireUser } from "@/lib/session";
import { getUserPreferences } from "@/lib/i18n/user-locale";

export default async function PosPage() {
  const user = await requireUser();
  const { locale } = await getUserPreferences(user.id);
  const [products, customers] = await Promise.all([listPosProducts(), listCustomers()]);

  const categories = [...new Set(products.map((p) => p.category.name))].sort();

  return (
    <PosClient
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        sellingPrice: Number(p.sellingPrice),
        quantity: p.quantity,
        category: { name: p.category.name },
        warehouse: { name: p.warehouse.name },
      }))}
      categories={categories}
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      locale={locale}
    />
  );
}
