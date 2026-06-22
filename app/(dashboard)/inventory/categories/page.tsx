import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCategories, listWarehouses } from "@/lib/application/services/inventory-service";
import { requireUser } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { CategoryFormDialog, DeleteCategoryButton } from "./category-form";

export default async function CategoriesPage() {
  const user = await requireUser();
  const t = await getTranslator(user.locale, "categories");
  const tc = await getTranslator(user.locale, "common");
  const [categories, warehouses] = await Promise.all([listCategories(), listWarehouses()]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={
          <CategoryFormDialog
            warehouses={warehouses}
            categories={categories}
            trigger={<Button>{t("addCategory")}</Button>}
          />
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("name")}</TableHead>
            <TableHead>{t("warehouse")}</TableHead>
            <TableHead>{t("parentCategory")}</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>{tc("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.warehouse.name}</TableCell>
              <TableCell>{c.parent?.name ?? "—"}</TableCell>
              <TableCell>{c._count.products}</TableCell>
              <TableCell className="flex gap-2">
                <CategoryFormDialog
                  warehouses={warehouses}
                  categories={categories}
                  category={c}
                  trigger={<Button variant="outline" size="sm">{tc("edit")}</Button>}
                />
                <DeleteCategoryButton id={c.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
