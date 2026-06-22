import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSalesSummary, listSales } from "@/lib/application/services/sale-service";
import { requireUser } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate, formatMoney } from "@/lib/utils";
import { SalesDateFilter } from "./sales-date-filter";

function parseRange(from?: string, to?: string) {
  const today = new Date().toISOString().slice(0, 10);
  const fromStr = from ?? today;
  const toStr = to ?? today;
  const fromDate = new Date(`${fromStr}T00:00:00`);
  const toDate = new Date(`${toStr}T23:59:59.999`);
  return { fromStr, toStr, fromDate, toDate };
}

const paymentLabels: Record<string, string> = {
  CASH: "cash",
  CARD: "card",
  ON_ACCOUNT: "onAccount",
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { money, locale } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "sales");
  const tp = await getTranslator(user.locale, "pos");
  const tc = await getTranslator(user.locale, "common");

  const { fromStr, toStr, fromDate, toDate } = parseRange(params.from, params.to);
  const [sales, summary] = await Promise.all([
    listSales({ from: fromDate, to: toDate }),
    getSalesSummary(fromDate, toDate),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button asChild>
            <Link href="/pos">{t("newSale")}</Link>
          </Button>
        }
      />

      <SalesDateFilter from={fromStr} to={toStr} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("salesCount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalAmount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{money(summary.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tp("cash")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{money(summary.cash)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{tp("card")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{money(summary.card)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("listTitle")} ({formatDate(fromDate, user.locale)}
            {fromStr !== toStr ? ` — ${formatDate(toDate, user.locale)}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sales.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">{t("noSales")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoiceNo")}</TableHead>
                  <TableHead>{tc("date")}</TableHead>
                  <TableHead>{t("customer")}</TableHead>
                  <TableHead>{t("items")}</TableHead>
                  <TableHead>{t("payment")}</TableHead>
                  <TableHead>{t("employee")}</TableHead>
                  <TableHead className="text-end">{tc("total")}</TableHead>
                  <TableHead>{tc("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(sale.createdAt, user.locale)}</TableCell>
                    <TableCell>{sale.customer?.name ?? sale.customerName ?? "—"}</TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-md">
                        {sale.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            <span className="font-medium">{item.productName}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              × {item.quantity} — {formatMoney(item.unitPrice, locale)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tp(paymentLabels[sale.paymentMethod] ?? "cash")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sale.createdBy.name}
                    </TableCell>
                    <TableCell className="text-end font-semibold">{money(sale.total)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/pos/sales/${sale.id}`}>{tc("view")}</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`/api/invoices/${sale.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {tc("print")}
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
