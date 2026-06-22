"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BackupPanel() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [restoring, setRestoring] = useState(false);

  function handleExport() {
    window.location.href = "/api/backup";
  }

  function handleRestore(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (!confirm(t("restoreConfirm"))) return;

    setRestoring(true);
    startTransition(async () => {
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        const res = await fetch("/api/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Restore failed");
        toast.success(tc("success"));
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tc("error"));
      } finally {
        setRestoring(false);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("backup")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("backupHint")}</p>
        <Button onClick={handleExport} disabled={pending}>
          {t("exportBackup")}
        </Button>
        <form onSubmit={handleRestore} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">{t("restoreBackup")}</p>
          <Input ref={fileRef} type="file" accept="application/json,.json" required />
          <Button type="submit" variant="destructive" disabled={restoring || pending}>
            {restoring ? tc("loading") : t("restoreBackup")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
