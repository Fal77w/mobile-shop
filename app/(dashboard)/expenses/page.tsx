import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listExpenses } from "@/lib/application/services/customer-service";
import { requireAccountantOrAdmin } from "@/lib/session";
import { getIntlForUser } from "@/lib/i18n/user-locale";
import { getTranslator } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { ExpenseFormDialog, DeleteExpenseButton } from "./expense-form";

export default async function ExpensesPage() {
  const user = await requireAccountantOrAdmin();
  const { money } = await getIntlForUser(user.id);
  const t = await getTranslator(user.locale, "expenses");
  const tc = await getTranslator(user.locale, "common");
  const expenses = await listExpenses();

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={<ExpenseFormDialog trigger={<Button>{t("addExpense")}</Button>} />}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("date")}</TableHead>
            <TableHead>{tc("name")}</TableHead>
            <TableHead>{t("amount")}</TableHead>
            <TableHead>{tc("notes")}</TableHead>
            <TableHead>{tc("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{formatDate(e.date, user.locale)}</TableCell>
              <TableCell className="font-medium">{e.title}</TableCell>
              <TableCell>{money(e.amount)}</TableCell>
              <TableCell>{e.notes ?? "—"}</TableCell>
              <TableCell>
                <DeleteExpenseButton id={e.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
