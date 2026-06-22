import { PageHeader } from "@/components/layout/page-header";
import { getShopSettings } from "@/lib/application/services/user-service";
import { requireAdmin } from "@/lib/session";
import { getTranslator } from "@/lib/i18n/server";
import { SettingsForm } from "./settings-form";
import { BackupPanel } from "./backup-panel";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const t = await getTranslator(admin.locale, "settings");
  const settings = await getShopSettings();

  return (
    <div>
      <PageHeader title={t("title")} />
      <SettingsForm
        settings={{
          shopName: settings?.shopName ?? "Mobile Shop",
          phone: settings?.phone ?? null,
          address: settings?.address ?? null,
          invoicePrefix: settings?.invoicePrefix ?? "INV",
          logoUrl: settings?.logoUrl ?? null,
          invoiceFooter: settings?.invoiceFooter ?? null,
          invoiceShowBarcode: settings?.invoiceShowBarcode ?? true,
        }}
      />
      <div className="mt-6">
        <BackupPanel />
      </div>
    </div>
  );
}
