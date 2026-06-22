import Link from "next/link";
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { canViewFinancials } from "@/lib/permissions";
import { getDashboardStats } from "@/lib/application/services/report-service";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { requireUser } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "dashboard");
  const tc = await getTranslator(user.locale, "common");
  const stats = await getDashboardStats(canViewFinancials(user.role));

  return (
    <div>
      <PageHeader title={t("title")} description={t("salesCount")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("todaySales")} value={money(stats.todaySales)} icon={DollarSign} accent="default" />
        {stats.todayGrossProfit !== null && (
          <StatCard title={t("todayProfit")} value={money(stats.todayGrossProfit)} icon={TrendingUp} accent="success" />
        )}
        <StatCard title={t("lowStock")} value={stats.lowStockCount} icon={AlertTriangle} accent="warning" />
        <StatCard title={t("totalDebt")} value={money(stats.totalDebt)} icon={CreditCard} accent="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentSales")}</CardTitle>
            <Link
              href="/pos"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              POS
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentSales.length === 0 ? (
              <EmptyState title={tc("noResults")} className="py-8" />
            ) : (
              stats.recentSales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/pos/sales/${sale.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{sale.invoiceNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {sale.customer?.name ?? sale.customerName ?? "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="font-semibold tabular-nums">{money(sale.total)}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {sale.paymentMethod}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("lowStock")}</CardTitle>
            <Link
              href="/inventory/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {tc("view")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.lowStock.length === 0 ? (
              <EmptyState title={tc("noResults")} className="py-8" />
            ) : (
              stats.lowStock.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.warehouse.name}</p>
                  </div>
                  <Badge variant="warning">{p.quantity}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
