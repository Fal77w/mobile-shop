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
import { listUsers } from "@/lib/application/services/user-service";
import { requireAdmin } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { UserFormDialog, DeleteUserButton } from "./user-form";
import { normalizeRole } from "@/lib/permissions";
import type { Role } from "@prisma/client";

function roleLabel(role: Role, t: (k: string) => string) {
  const r = normalizeRole(role);
  if (r === "ADMIN") return t("admin");
  if (r === "ACCOUNTANT") return t("accountant");
  return t("sales");
}

export default async function UsersPage() {
  const admin = await requireAdmin();
  const t = await getTranslator(admin.locale, "users");
  const tc = await getTranslator(admin.locale, "common");
  const users = await listUsers();

  return (
    <div>
      <PageHeader
        title={t("title")}
        actions={<UserFormDialog trigger={<Button>{t("addUser")}</Button>} />}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("name")}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead>{tc("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                  {roleLabel(u.role, t)}
                </Badge>
              </TableCell>
              <TableCell>
                {u.id !== admin.id && <DeleteUserButton id={u.id} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
