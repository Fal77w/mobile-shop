"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RepairStatus } from "@prisma/client";
import { updateRepairStatusAction } from "./actions";

const STATUSES: RepairStatus[] = ["NEW", "IN_PROGRESS", "READY", "DELIVERED"];

export function RepairStatusSelect({
  id,
  current,
}: {
  id: string;
  current: RepairStatus;
}) {
  const t = useTranslations("repairs");
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={current}
      disabled={pending}
      onValueChange={(status) => {
        startTransition(async () => {
          const result = await updateRepairStatusAction(id, status as RepairStatus);
          if ("error" in result) toast.error(result.error);
          else toast.success(tc("success"));
        });
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {t(`status.${s}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
