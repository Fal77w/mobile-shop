import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getDailySalesReport,
  getMonthlySalesReport,
  getProfitReport,
  getDebtReport,
  getExpenseReport,
  getLowStockReport,
  getSalesReport,
  getProfitByItemReport,
} from "@/lib/application/services/report-service";
import { getInventoryValuation } from "@/lib/application/services/backup-service";
import {
  getRepairReport,
  getProgrammingIncomeReport,
} from "@/lib/application/services/repair-service";
import { requireUser } from "@/lib/session";
import { canViewProfitReports } from "@/lib/permissions";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { ReportsDateFilter } from "./reports-date-filter";

function parseRange(from?: string, to?: string) {
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(`${to}T23:59:59.999`) : undefined;
  return { fromDate, toDate };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "reports");
  const tc = await getTranslator(user.locale, "common");
  const showFinancials = canViewProfitReports(user.role);
  const today = new Date();
  const { fromDate, toDate } = parseRange(params.from, params.to);

  const [
    daily,
    monthly,
    profit,
    debts,
    expenseReport,
    lowStock,
    rangeSales,
    profitByItem,
    valuation,
    repairReport,
    programmingReport,
  ] = await Promise.all([
    getDailySalesReport(today),
    getMonthlySalesReport(today),
    showFinancials ? getProfitReport(fromDate, toDate) : null,
    getDebtReport(),
    getExpenseReport(fromDate, toDate),
    getLowStockReport(),
    fromDate && toDate ? getSalesReport(fromDate, toDate) : null,
    showFinancials ? getProfitByItemReport(fromDate, toDate) : null,
    showFinancials ? getInventoryValuation() : null,
    getRepairReport(fromDate, toDate),
    showFinancials ? getProgrammingIncomeReport(fromDate, toDate) : null,
  ]);

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <ReportsDateFilter from={params.from} to={params.to} />
      <Tabs defaultValue="daily">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="daily">{t("dailySales")}</TabsTrigger>
          <TabsTrigger value="monthly">{t("monthlySales")}</TabsTrigger>
          {fromDate && toDate && (
            <TabsTrigger value="range">{t("dateRangeSales")}</TabsTrigger>
          )}
          {showFinancials && <TabsTrigger value="profit">{t("profit")}</TabsTrigger>}
          {showFinancials && profitByItem && (
            <TabsTrigger value="profitByItem">{t("profitByItem")}</TabsTrigger>
          )}
          {showFinancials && valuation && (
            <TabsTrigger value="valuation">{t("inventoryValuation")}</TabsTrigger>
          )}
          <TabsTrigger value="debts">{t("debts")}</TabsTrigger>
          <TabsTrigger value="expenses">{t("expenseReport")}</TabsTrigger>
          <TabsTrigger value="lowStock">{t("lowStock")}</TabsTrigger>
          <TabsTrigger value="repairs">{t("repairReport")}</TabsTrigger>
          {showFinancials && programmingReport && (
            <TabsTrigger value="programming">{t("programmingIncome")}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>{t("dailySales")} — {formatDate(today, user.locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div><p className="text-sm text-muted-foreground">{tc("total")}</p><p className="text-2xl font-bold">{money(daily.totalSales)}</p></div>
                <div><p className="text-sm text-muted-foreground">{t("count")}</p><p className="text-2xl font-bold">{daily.count}</p></div>
                {showFinancials && (
                  <div><p className="text-sm text-muted-foreground">{t("grossProfit")}</p><p className="text-2xl font-bold">{money(daily.grossProfit)}</p></div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>{t("monthlySales")} — {monthly.month}/{monthly.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">{money(monthly.totalSales)} ({monthly.count})</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc("date")}</TableHead>
                    <TableHead>{tc("total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.byDay.map((d) => (
                    <TableRow key={d.date}>
                      <TableCell>{d.date}</TableCell>
                      <TableCell>{money(d.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {rangeSales && (
          <TabsContent value="range">
            <Card>
              <CardHeader>
                <CardTitle>{t("dateRangeSales")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-4">
                  <div><p className="text-sm text-muted-foreground">{tc("total")}</p><p className="text-2xl font-bold">{money(rangeSales.totalSales)}</p></div>
                  <div><p className="text-sm text-muted-foreground">{t("count")}</p><p className="text-2xl font-bold">{rangeSales.count}</p></div>
                  {showFinancials && (
                    <div><p className="text-sm text-muted-foreground">{t("grossProfit")}</p><p className="text-2xl font-bold">{money(rangeSales.grossProfit)}</p></div>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tc("date")}</TableHead>
                      <TableHead>{t("invoice")}</TableHead>
                      <TableHead>{tc("total")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rangeSales.sales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{formatDate(s.createdAt, user.locale)}</TableCell>
                        <TableCell>{s.invoiceNumber}</TableCell>
                        <TableCell>{money(s.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showFinancials && profit && (
          <TabsContent value="profit">
            <Card>
              <CardHeader><CardTitle>{t("profit")}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><p className="text-sm text-muted-foreground">{t("grossProfit")}</p><p className="text-2xl font-bold">{money(profit.grossProfit)}</p></div>
                  <div><p className="text-sm text-muted-foreground">{t("expenses")}</p><p className="text-2xl font-bold">{money(profit.totalExpenses)}</p></div>
                  <div><p className="text-sm text-muted-foreground">{t("netProfit")}</p><p className="text-2xl font-bold">{money(profit.netProfit)}</p></div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-2">{t("byWarehouse")}</h3>
                    <Table>
                      <TableBody>
                        {profit.byWarehouse.map((w) => (
                          <TableRow key={w.name}>
                            <TableCell>{w.name}</TableCell>
                            <TableCell>{money(w.profit)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t("byCategory")}</h3>
                    <Table>
                      <TableBody>
                        {profit.byCategory.map((c) => (
                          <TableRow key={c.name}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>{money(c.profit)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showFinancials && profitByItem && (
          <TabsContent value="profitByItem">
            <Card>
              <CardHeader><CardTitle>{t("profitByItem")}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tc("name")}</TableHead>
                      <TableHead>{tc("quantity")}</TableHead>
                      <TableHead>{t("revenue")}</TableHead>
                      <TableHead>{t("profit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitByItem.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{money(row.revenue)}</TableCell>
                        <TableCell>{money(row.profit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {showFinancials && valuation && (
          <TabsContent value="valuation">
            <Card>
              <CardHeader>
                <CardTitle>{t("inventoryValuation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div><p className="text-sm text-muted-foreground">{t("totalCostValue")}</p><p className="text-xl font-bold">{money(valuation.totalCost)}</p></div>
                  <div><p className="text-sm text-muted-foreground">{t("totalRetailValue")}</p><p className="text-xl font-bold">{money(valuation.totalRetail)}</p></div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tc("name")}</TableHead>
                      <TableHead>{t("warehouse")}</TableHead>
                      <TableHead>{t("stock")}</TableHead>
                      <TableHead>{t("costValue")}</TableHead>
                      <TableHead>{t("retailValue")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {valuation.rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.warehouse}</TableCell>
                        <TableCell>{r.quantity}</TableCell>
                        <TableCell>{money(r.costValue)}</TableCell>
                        <TableCell>{money(r.retailValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="debts">
          <Card>
            <CardHeader>
              <CardTitle>{t("debts")} — {money(debts.totalDebt)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc("name")}</TableHead>
                    <TableHead>{tc("phone")}</TableHead>
                    <TableHead>{t("debt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.phone ?? "—"}</TableCell>
                      <TableCell>{money(c.totalDebt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>{t("expenseReport")} — {money(expenseReport.total)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc("date")}</TableHead>
                    <TableHead>{tc("name")}</TableHead>
                    <TableHead>{tc("total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseReport.expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{formatDate(e.date, user.locale)}</TableCell>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{money(e.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowStock">
          <Card>
            <CardHeader><CardTitle>{t("lowStock")}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc("name")}</TableHead>
                    <TableHead>{t("warehouse")}</TableHead>
                    <TableHead>{t("stock")}</TableHead>
                    <TableHead>{t("alert")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.warehouse.name}</TableCell>
                      <TableCell><Badge variant="warning">{p.quantity}</Badge></TableCell>
                      <TableCell>{p.lowStockAlert}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs">
          <Card>
            <CardHeader>
              <CardTitle>{t("repairReport")} — {money(repairReport.totalIncome)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{t("commonIssues")}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("issue")}</TableHead>
                      <TableHead>{t("count")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repairReport.commonIssues.map((i) => (
                      <TableRow key={i.issue}>
                        <TableCell>{i.issue}</TableCell>
                        <TableCell>{i.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showFinancials && programmingReport && (
          <TabsContent value="programming">
            <Card>
              <CardHeader>
                <CardTitle>{t("programmingIncome")} — {money(programmingReport.total)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("invoice")}</TableHead>
                      <TableHead>{tc("date")}</TableHead>
                      <TableHead>{tc("total")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programmingReport.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sale.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(item.sale.createdAt, user.locale)}</TableCell>
                        <TableCell>{money(item.lineTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
