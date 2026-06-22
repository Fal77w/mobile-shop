"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "../actions";

export function DeleteProductButton({ id }: { id: string }) {
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(tc("confirm"))) return;
        startTransition(async () => {
          const result = await deleteProductAction(id);
          if ("error" in result) toast.error(result.error);
          else toast.success(tc("success"));
        });
      }}
    >
      {tc("delete")}
    </Button>
  );
}
