import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductFormDialog } from "@/components/forms/product-form";
import { listProducts, listWarehouses, listCategories } from "@/lib/application/services/inventory-service";
import { requireUser } from "@/lib/session";
import { canEditCostPrice } from "@/lib/permissions";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { DeleteProductButton } from "@/app/(dashboard)/inventory/products/delete-buttons";

export default async function ProductsPage() {
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "products");
  const tc = await getTranslator(user.locale, "common");

  const canEditCost = canEditCostPrice(user.role);

  const [products, warehouses, categories] = await Promise.all([
    listProducts(),
    listWarehouses(),
    listCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={
          <ProductFormDialog
            warehouses={warehouses}
            categories={categories}
            canEditCost={canEditCost}
            trigger={<Button>{t("addProduct")}</Button>}
          />
        }
      />
      {products.length === 0 ? (
        <EmptyState
          title={tc("noResults")}
          action={
            <ProductFormDialog
              warehouses={warehouses}
              categories={categories}
              canEditCost={canEditCost}
              trigger={<Button>{t("addProduct")}</Button>}
            />
          }
        />
      ) : (
        <DataTableShell footer={`${products.length} ${t("title").toLowerCase()}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("name")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("warehouse")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead>{t("sellingPrice")}</TableHead>
                <TableHead>{t("stock")}</TableHead>
                <TableHead>{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>{p.warehouse.name}</TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell className="tabular-nums">{money(p.sellingPrice)}</TableCell>
                  <TableCell>
                    <Badge variant={p.quantity <= p.lowStockAlert ? "warning" : "secondary"}>
                      {p.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ProductFormDialog
                        warehouses={warehouses}
                        categories={categories}
                        product={p}
                        canEditCost={canEditCost}
                        trigger={<Button variant="outline" size="sm">{tc("edit")}</Button>}
                      />
                      <DeleteProductButton id={p.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}
    </div>
  );
}
