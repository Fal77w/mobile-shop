import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSale } from "@/lib/application/services/sale-service";
import { requireUser } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "invoice");
  const tp = await getTranslator(user.locale, "pos");
  const tc = await getTranslator(user.locale, "common");

  const sale = await getSale(id);
  if (!sale) notFound();

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/sales">{t("viewAllSales")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pos">{tc("back")}</Link>
            </Button>
            <Button asChild>
              <a href={`/api/invoices/${sale.id}/pdf`} target="_blank" rel="noreferrer">
                {tc("print")}
              </a>
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">{t("invoiceNo")}</p>
              <p className="font-medium">{sale.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{tc("date")}</p>
              <p className="font-medium">{formatDate(sale.createdAt, user.locale)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("customer")}</p>
              <p className="font-medium">{sale.customer?.name ?? sale.customerName ?? "—"}</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("item")}</TableHead>
                <TableHead>{t("qty")}</TableHead>
                <TableHead>{t("unitPrice")}</TableHead>
                <TableHead>{t("lineTotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{money(item.unitPrice)}</TableCell>
                  <TableCell>{money(item.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between text-lg font-bold border-t pt-4">
            <span>{t("grandTotal")}</span>
            <span>{money(sale.total)}</span>
          </div>
          <p className="text-sm text-muted-foreground">{tp("saleComplete")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
