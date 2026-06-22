import { Suspense } from "react";
import { cookies } from "next/headers";
import LoginPage from "./login-client";
import { IntlProvider } from "@/components/intl-provider";
import { getMessages, getDirection } from "@/lib/i18n";

export default async function Page() {
  const jar = await cookies();
  const cookieLocale = jar.get("locale")?.value;
  const locale = cookieLocale === "en" || cookieLocale === "ar" ? cookieLocale : "ar";

  return (
    <IntlProvider locale={locale} messages={getMessages(locale)}>
      <div dir={getDirection(locale)} className="min-h-screen bg-background">
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">...</div>}>
          <LoginPage />
        </Suspense>
      </div>
    </IntlProvider>
  );
}
