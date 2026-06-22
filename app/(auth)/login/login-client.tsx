"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginLanguageSwitcher } from "@/components/auth/login-language-switcher";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const ta = useTranslations("app");
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(t("invalidCredentials"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(99_102_241/0.12),transparent)]"
        aria-hidden
      />
      <Card className="relative w-full max-w-md border-border/60 shadow-lg">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Store className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">{ta("name")}</CardTitle>
            <CardDescription>{t("signInSubtitle")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginLanguageSwitcher />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@shop.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {loading ? tc("loading") : t("signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
