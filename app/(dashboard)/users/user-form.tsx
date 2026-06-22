"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction, deleteUserAction } from "./actions";

export function UserFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createUserAction(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(tc("success"));
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addUser")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tc("name")}</Label>
            <Input name="name" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-2">
            <Label>{t("role")}</Label>
            <Select name="role" defaultValue="SALES">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">{t("admin")}</SelectItem>
                <SelectItem value="ACCOUNTANT">{t("accountant")}</SelectItem>
                <SelectItem value="SALES">{t("sales")}</SelectItem>
                <SelectItem value="EMPLOYEE">{t("employee")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteUserButton({ id }: { id: string }) {
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(tc("confirm"))) return;
        startTransition(async () => {
          const result = await deleteUserAction(id);
          if ("error" in result) toast.error(result.error);
          else toast.success(tc("success"));
        });
      }}
    >
      {tc("delete")}
    </Button>
  );
}
