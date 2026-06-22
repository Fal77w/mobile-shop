import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listRepairOrders } from "@/lib/application/services/repair-service";
import { requireUser } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { RepairForm } from "./repair-form";
import { RepairStatusSelect } from "./repair-status-button";

export default async function RepairsPage() {
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "repairs");
  const tc = await getTranslator(user.locale, "common");
  const orders = await listRepairOrders();

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <RepairForm />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("orderNumber")}</TableHead>
            <TableHead>{t("customerName")}</TableHead>
            <TableHead>{tc("phone")}</TableHead>
            <TableHead>{t("deviceType")}</TableHead>
            <TableHead>{t("issue")}</TableHead>
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
              <TableCell className="max-w-[200px] truncate">{o.issue}</TableCell>
              <TableCell>{money(o.cost)}</TableCell>
              <TableCell>
                <RepairStatusSelect id={o.id} current={o.status} />
              </TableCell>
              <TableCell>{formatDate(o.createdAt, user.locale)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
