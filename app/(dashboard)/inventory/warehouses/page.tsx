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
import { listWarehouses } from "@/lib/application/services/inventory-service";
import { requireUser } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { WarehouseFormDialog, DeleteWarehouseButton } from "./warehouse-form";

export default async function WarehousesPage() {
  const user = await requireUser();
  const t = await getTranslator(user.locale, "warehouses");
  const tc = await getTranslator(user.locale, "common");
  const warehouses = await listWarehouses();

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={
          <WarehouseFormDialog trigger={<Button>{t("addWarehouse")}</Button>} />
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("name")}</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>{tc("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((w) => (
            <TableRow key={w.id}>
              <TableCell className="font-medium">{w.name}</TableCell>
              <TableCell>{w._count.categories}</TableCell>
              <TableCell>{w._count.products}</TableCell>
              <TableCell className="flex gap-2">
                <WarehouseFormDialog
                  warehouse={w}
                  trigger={<Button variant="outline" size="sm">{tc("edit")}</Button>}
                />
                <DeleteWarehouseButton id={w.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
