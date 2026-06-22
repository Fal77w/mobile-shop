"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { setLocaleCookieAction } from "@/app/(auth)/login/actions";

export function LoginLanguageSwitcher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const locale = useLocale();

  function switchLocale(next: "ar" | "en") {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleCookieAction(next);
      router.refresh();
    });
  }

  return (
    <div className="mb-6 flex justify-center">
      <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5">
        {(["ar", "en"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            disabled={pending}
            onClick={() => switchLocale(lang)}
            className={cn(
              "min-w-[4.5rem] rounded-md px-3 py-1.5 text-xs font-medium transition-all touch-manipulation",
              locale === lang
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lang === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </div>
    </div>
  );
}
