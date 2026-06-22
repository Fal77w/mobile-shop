"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ReportsDateFilter({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const fromVal = fd.get("from") as string;
    const toVal = fd.get("to") as string;
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="report-from">{t("fromDate")}</Label>
            <Input id="report-from" name="from" type="date" defaultValue={from} className="w-auto min-w-[10rem]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-to">{t("toDate")}</Label>
            <Input id="report-to" name="to" type="date" defaultValue={to} className="w-auto min-w-[10rem]" />
          </div>
          <Button type="submit">{tc("search")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
