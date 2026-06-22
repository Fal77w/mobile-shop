"use client";

import type { Role } from "@prisma/client";
import { Moon, Sun, LogOut, Menu, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getGroupedNavItems } from "@/components/layout/nav-config";
import { MobileMenuSheet } from "@/components/layout/mobile-menu-sheet";
import { Badge } from "@/components/ui/badge";
import { normalizeRole } from "@/lib/permissions";

function roleBadgeKey(role: Role) {
  const normalized = normalizeRole(role);
  if (normalized === "ADMIN") return "admin";
  if (normalized === "ACCOUNTANT") return "accountant";
  return "sales";
}

function NavLinks({
  onNavigate,
  role,
}: {
  onNavigate?: () => void;
  role: Role;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const groups = getGroupedNavItems(role);

  return (
    <div className="space-y-6">
      {groups.map(({ group, items }) => (
        <div key={group}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {t(`groups.${group}`)}
          </p>
          <div className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all touch-manipulation",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                  <span className="truncate">{t(item.key)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const tc = useTranslations("common");

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("shrink-0 touch-manipulation", className)}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? tc("lightMode") : tc("darkMode")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const tc = useTranslations("common");

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("shrink-0 text-destructive hover:text-destructive touch-manipulation", className)}
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label={tc("logout")}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}

function SidebarFooter({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const tc = useTranslations("common");

  return (
    <div className={cn("space-y-1 border-t border-border/60 bg-card p-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start min-h-10 touch-manipulation text-muted-foreground"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-4 w-4 me-2" /> : <Moon className="h-4 w-4 me-2" />}
        {theme === "dark" ? tc("lightMode") : tc("darkMode")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start min-h-10 text-destructive hover:text-destructive touch-manipulation"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4 me-2" />
        {tc("logout")}
      </Button>
    </div>
  );
}

export function Sidebar({ shopName, logoUrl }: { shopName: string; logoUrl?: string | null }) {
  const { data: session } = useSession();
  const role = (session?.user?.role as Role) ?? "EMPLOYEE";

  return (
    <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-width)] shrink-0 flex-col border-e border-border/60 bg-card md:flex">
      <div className="flex h-[var(--header-height)] shrink-0 items-center gap-2.5 border-b border-border/60 px-5">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
        )}
        <Link href="/dashboard" className="truncate text-base font-semibold tracking-tight" title={shopName}>
          {shopName}
        </Link>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-3">
        <NavLinks role={role} />
      </nav>
      <SidebarFooter className="shrink-0" />
    </aside>
  );
}

export function Header({ shopName }: { shopName: string }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user?.role as Role) ?? "EMPLOYEE";
  const tu = useTranslations("users");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[var(--header-height)] shrink-0 items-center gap-3 border-b border-border/60 bg-card/95 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 pt-[env(safe-area-inset-top)] md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <p className="truncate text-sm font-semibold text-foreground md:hidden">{shopName}</p>
        <div className="min-w-0 flex-1" />
        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                {session.user.name}
              </span>
              <Badge variant="secondary" className="text-[10px] uppercase">
                {tu(roleBadgeKey(role))}
              </Badge>
            </div>
          ) : null}
          <ThemeToggleButton />
          <LogoutButton />
          <LanguageSwitcher />
        </div>
      </header>
      <MobileMenuSheet open={open} onOpenChange={setOpen} role={role} shopName={shopName} />
    </>
  );
}

export { NavLinks, SidebarFooter };
