"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordPaymentAction } from "@/app/(dashboard)/customers/actions";

export function PaymentForm({ customerId }: { customerId: string }) {
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("customerId", customerId);
    startTransition(async () => {
      const result = await recordPaymentAction(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(tc("success"));
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recordPayment")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>{tc("date")}</Label>
            <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("paid")}</Label>
            <Input name="amount" type="number" step="0.01" min="0.01" required />
          </div>
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label>{tc("notes")}</Label>
            <Input name="notes" />
          </div>
          <Button type="submit" disabled={pending}>{tc("save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
