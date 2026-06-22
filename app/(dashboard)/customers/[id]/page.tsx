import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomerReport } from "@/lib/application/services/customer-service";
import { requireUser } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { PaymentForm } from "./payment-form";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, CreditCard, Wallet } from "lucide-react";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "customers");
  const tc = await getTranslator(user.locale, "common");

  const report = await getCustomerReport(id);
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={report.customer.name} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t("totalPurchases")} value={money(report.totalPurchases)} icon={DollarSign} />
        <StatCard title={t("paid")} value={money(report.totalPaid)} icon={Wallet} />
        <StatCard title={t("remaining")} value={money(report.remaining)} icon={CreditCard} />
      </div>
      <PaymentForm customerId={id} />
      <Card>
        <CardHeader><CardTitle>{t("payments")}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("date")}</TableHead>
                <TableHead>{t("paid")}</TableHead>
                <TableHead>{tc("notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.customer.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date, user.locale)}</TableCell>
                  <TableCell>{money(p.amount)}</TableCell>
                  <TableCell>{p.notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
