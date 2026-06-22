import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { listCustomers } from "@/lib/application/services/customer-service";
import { requireUser } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { CustomerFormDialog } from "./customer-form";

export default async function CustomersPage() {
  const user = await requireUser();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "customers");
  const tc = await getTranslator(user.locale, "common");
  const customers = await listCustomers();

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={
          <CustomerFormDialog trigger={<Button>{t("addCustomer")}</Button>} />
        }
      />
      {customers.length === 0 ? (
        <EmptyState
          title={tc("noResults")}
          action={<CustomerFormDialog trigger={<Button>{t("addCustomer")}</Button>} />}
        />
      ) : (
        <DataTableShell footer={`${customers.length}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("name")}</TableHead>
                <TableHead>{tc("phone")}</TableHead>
                <TableHead>{t("totalDebt")}</TableHead>
                <TableHead>{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={Number(c.totalDebt) > 0 ? "warning" : "secondary"}>
                      {money(c.totalDebt)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/customers/${c.id}`}>{tc("view")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      )}
    </div>
  );
}
