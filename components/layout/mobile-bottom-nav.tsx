"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItem, mobileBottomNavKeys } from "@/components/layout/nav-config";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-[backdrop-filter]:bg-card/90 md:hidden">
      <div className="flex">
        {mobileBottomNavKeys.map((key) => {
          const item = getNavItem(key);
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={key}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium touch-manipulation transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  active && "bg-primary/10"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
              </span>
              <span className="truncate px-1">{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
