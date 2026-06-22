import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { listStockMovements } from "@/lib/application/services/stock-movement-service";
import { requireUser } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";

export default async function StockMovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const t = await getTranslator(user.locale, "movements");
  const tc = await getTranslator(user.locale, "common");
  const tr = await getTranslator(user.locale, "reports");

  const from = params.from ? new Date(params.from) : undefined;
  const to = params.to ? new Date(`${params.to}T23:59:59`) : undefined;

  const movements = await listStockMovements({ from, to });

  return (
    <div>
      <PageHeader title={t("title")} />
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mov-from">{tr("fromDate")}</Label>
              <Input id="mov-from" name="from" type="date" defaultValue={params.from} className="w-auto min-w-[10rem]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mov-to">{tr("toDate")}</Label>
              <Input id="mov-to" name="to" type="date" defaultValue={params.to} className="w-auto min-w-[10rem]" />
            </div>
            <Button type="submit">{tc("search")}</Button>
          </form>
        </CardContent>
      </Card>
      {movements.length === 0 ? (
        <EmptyState title={tc("noResults")} />
      ) : (
        <DataTableShell footer={`${movements.length}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("date")}</TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("warehouse")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{tc("quantity")}</TableHead>
                <TableHead>{t("balanceAfter")}</TableHead>
                <TableHead>{t("reference")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{formatDate(m.createdAt, user.locale)}</TableCell>
                  <TableCell className="font-medium">{m.product.name}</TableCell>
                  <TableCell>{m.warehouse.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t(`types.${m.type}`)}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums font-medium">
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </TableCell>
                  <TableCell className="tabular-nums">{m.balanceAfter}</TableCell>
                  <TableCell className="text-muted-foreground">{m.referenceType ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}
    </div>
  );
}
