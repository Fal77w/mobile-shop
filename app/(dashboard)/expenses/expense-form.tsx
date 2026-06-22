"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createExpenseAction, deleteExpenseAction } from "../customers/actions";

export function ExpenseFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const t = useTranslations("expenses");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createExpenseAction(formData);
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
          <DialogTitle>{t("addExpense")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tc("name")}</Label>
            <Input name="title" required placeholder="Rent, Electricity..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("amount")}</Label>
              <Input name="amount" type="number" step="0.01" min="0.01" required />
            </div>
            <div className="space-y-2">
              <Label>{tc("date")}</Label>
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{tc("notes")}</Label>
            <Textarea name="notes" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
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
          const result = await deleteExpenseAction(id);
          if ("error" in result) toast.error(result.error);
          else toast.success(tc("success"));
        });
      }}
    >
      {tc("delete")}
    </Button>
  );
}
