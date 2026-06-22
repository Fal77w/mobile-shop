"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function SalesDateFilter({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const t = useTranslations("sales");
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
    router.push(`/sales?${params.toString()}`);
  }

  function setToday() {
    const today = new Date().toISOString().slice(0, 10);
    router.push(`/sales?from=${today}&to=${today}`);
  }

  function setThisWeek() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    router.push(
      `/sales?from=${start.toISOString().slice(0, 10)}&to=${end.toISOString().slice(0, 10)}`
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sales-from">{t("fromDate")}</Label>
            <Input id="sales-from" name="from" type="date" defaultValue={from} className="w-auto min-w-[10rem]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sales-to">{t("toDate")}</Label>
            <Input id="sales-to" name="to" type="date" defaultValue={to} className="w-auto min-w-[10rem]" />
          </div>
          <Button type="submit">{tc("search")}</Button>
          <Button type="button" variant="outline" onClick={setToday}>
            {t("today")}
          </Button>
          <Button type="button" variant="outline" onClick={setThisWeek}>
            {t("thisWeek")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
