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
import {
  listTransfers,
  listWarehouses,
  listProducts,
} from "@/lib/application/services/inventory-service";
import { requireUser } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { TransferFormDialog } from "./transfer-form";

export default async function TransfersPage() {
  const user = await requireUser();
  const t = await getTranslator(user.locale, "transfers");
  const tc = await getTranslator(user.locale, "common");

  const [transfers, warehouses, products] = await Promise.all([
    listTransfers(),
    listWarehouses(),
    listProducts(),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={
          <TransferFormDialog
            warehouses={warehouses}
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              warehouseId: p.warehouseId,
              quantity: p.quantity,
            }))}
            trigger={<Button>{t("newTransfer")}</Button>}
          />
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("date")}</TableHead>
            <TableHead>{t("product")}</TableHead>
            <TableHead>{t("from")}</TableHead>
            <TableHead>{t("to")}</TableHead>
            <TableHead>{tc("quantity")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((tr) => (
            <TableRow key={tr.id}>
              <TableCell>{formatDate(tr.createdAt, user.locale)}</TableCell>
              <TableCell>{tr.product.name}</TableCell>
              <TableCell>{tr.fromWarehouse.name}</TableCell>
              <TableCell>{tr.toWarehouse.name}</TableCell>
              <TableCell>{tr.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
