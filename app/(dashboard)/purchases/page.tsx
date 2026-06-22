import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPurchases } from "@/lib/application/services/purchase-service";
import { listProducts } from "@/lib/application/services/inventory-service";
import { requireAccountantOrAdmin } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { PurchaseFormClient } from "./purchase-form";

export default async function PurchasesPage() {
  const user = await requireAccountantOrAdmin();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "purchases");
  const tc = await getTranslator(user.locale, "common");

  const [purchases, products] = await Promise.all([listPurchases(), listProducts()]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <PurchaseFormClient products={products} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("date")}</TableHead>
            <TableHead>{t("supplier")}</TableHead>
            <TableHead>{t("invoiceNo")}</TableHead>
            <TableHead>{tc("total")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{formatDate(p.date, user.locale)}</TableCell>
              <TableCell>{p.supplierName}</TableCell>
              <TableCell>{p.supplierInvoiceNo ?? "—"}</TableCell>
              <TableCell>{money(p.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
