"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { setLocaleAction } from "@/app/(dashboard)/settings/actions";

export function LanguageSwitcher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const locale = useLocale();
  const t = useTranslations("settings");

  function switchLocale(next: "ar" | "en") {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div
      className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5"
      role="group"
      aria-label={t("language")}
    >
      {(["ar", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          disabled={pending}
          onClick={() => switchLocale(lang)}
          className={cn(
            "min-w-[2.25rem] rounded-md px-2 py-1 text-xs font-medium transition-all touch-manipulation",
            locale === lang
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {lang === "ar" ? "ع" : "EN"}
        </button>
      ))}
    </div>
  );
}
