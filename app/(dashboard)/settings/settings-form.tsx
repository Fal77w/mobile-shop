"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateShopSettingsAction } from "./actions";

type Settings = {
  shopName: string;
  phone: string | null;
  address: string | null;
  invoicePrefix: string;
  logoUrl: string | null;
  invoiceFooter: string | null;
  invoiceShowBarcode: boolean;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateShopSettingsAction(formData);
      if ("error" in result) toast.error(result.error);
      else toast.success(tc("success"));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("shopInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("shopName")}</Label>
            <Input name="shopName" defaultValue={settings.shopName} required />
          </div>
          <div className="space-y-2">
            <Label>{tc("phone")}</Label>
            <Input name="phone" defaultValue={settings.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>{t("address")}</Label>
            <Textarea name="address" defaultValue={settings.address ?? ""} />
          </div>
          <div className="space-y-2">
            <Label>{t("shopLogo")}</Label>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.shopName}
                className="mb-2 h-16 w-auto rounded border object-contain"
              />
            ) : null}
            <Input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
            <p className="text-xs text-muted-foreground">{t("logoHint")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("invoiceSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("invoicePrefix")}</Label>
            <Input name="invoicePrefix" defaultValue={settings.invoicePrefix} required />
          </div>
          <div className="space-y-2">
            <Label>{t("invoiceFooter")}</Label>
            <Textarea
              name="invoiceFooter"
              defaultValue={settings.invoiceFooter ?? ""}
              placeholder={t("invoiceFooterPlaceholder")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="invoiceShowBarcode"
              defaultChecked={settings.invoiceShowBarcode}
              className="rounded border-input"
            />
            {t("invoiceShowBarcode")}
          </label>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? tc("loading") : tc("save")}
        </Button>
      </div>
    </form>
  );
}
