import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listProgrammingOrders } from "@/lib/application/services/programming-service";
import { requireUser } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { ProgrammingForm } from "./programming-form";
import { ProgrammingStatusSelect } from "./programming-status-button";

export default async function ProgrammingPage() {
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "programming");
  const tc = await getTranslator(user.locale, "common");
  const orders = await listProgrammingOrders();

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <ProgrammingForm />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("orderNumber")}</TableHead>
            <TableHead>{t("customerName")}</TableHead>
            <TableHead>{tc("phone")}</TableHead>
            <TableHead>{t("deviceType")}</TableHead>
            <TableHead>{t("serviceType")}</TableHead>
            <TableHead>{t("cost")}</TableHead>
            <TableHead>{t("statusLabel")}</TableHead>
            <TableHead>{tc("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.orderNumber}</TableCell>
              <TableCell>{o.customerName}</TableCell>
              <TableCell>{o.phone}</TableCell>
              <TableCell>{o.deviceType}</TableCell>
              <TableCell className="max-w-[200px] truncate">{o.serviceType}</TableCell>
              <TableCell>{money(o.cost)}</TableCell>
              <TableCell>
                <ProgrammingStatusSelect id={o.id} current={o.status} />
              </TableCell>
              <TableCell>{formatDate(o.createdAt, user.locale)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
