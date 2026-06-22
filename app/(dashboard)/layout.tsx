import { Sidebar, Header } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getShopSettings } from "@/lib/application/services/user-service";
import { requireUser } from "@/lib/session";
import { IntlProvider } from "@/components/intl-provider";
import { getMessages, getDirection } from "@/lib/i18n";
import { getUserPreferences } from "@/lib/i18n/user-locale";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const { locale } = await getUserPreferences(user.id);
  const messages = getMessages(locale);
  const settings = await getShopSettings();
  const shopName = settings?.shopName ?? "متجر الموبايلات";

  return (
    <IntlProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen" dir={getDirection(locale)}>
        <Sidebar shopName={shopName} logoUrl={settings?.logoUrl} />
        <div className="app-shell-main flex min-w-0 flex-1 flex-col">
          <Header shopName={shopName} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
            <div className="page-container">{children}</div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </IntlProvider>
  );
}
