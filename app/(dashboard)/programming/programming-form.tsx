"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProgrammingOrderAction } from "./actions";

const SERVICE_SUGGESTIONS = [
  "فك حساب iCloud",
  "تخطي FRP",
  "فلاش / سوفتوير",
  "فك شبكة",
  "استرجاع بيانات",
  "تغيير لغة",
];

export function ProgrammingForm() {
  const t = useTranslations("programming");
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createProgrammingOrderAction(formData);
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
        <CardTitle>{t("newOrder")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("customerName")}</Label>
            <Input name="customerName" required />
          </div>
          <div className="space-y-2">
            <Label>{tc("phone")}</Label>
            <Input name="phone" required />
          </div>
          <div className="space-y-2">
            <Label>{t("deviceType")}</Label>
            <Input name="deviceType" placeholder="آيفون 14، سامسونج S24..." required />
          </div>
          <div className="space-y-2">
            <Label>{t("serviceType")}</Label>
            <Input name="serviceType" list="programming-services" required />
            <datalist id="programming-services">
              {SERVICE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label>{t("cost")}</Label>
            <Input name="cost" type="number" step="0.01" min={0} required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{tc("notes")}</Label>
            <Textarea name="notes" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
