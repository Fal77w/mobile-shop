"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createWarehouseAction, updateWarehouseAction, deleteWarehouseAction } from "../actions";

export function WarehouseFormDialog({
  warehouse,
  trigger,
}: {
  warehouse?: { id: string; name: string };
  trigger: React.ReactNode;
}) {
  const t = useTranslations("warehouses");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = warehouse
        ? await updateWarehouseAction(warehouse.id, formData)
        : await createWarehouseAction(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(tc("success"));
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{warehouse ? tc("edit") : t("addWarehouse")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tc("name")}</Label>
            <Input name="name" defaultValue={warehouse?.name} required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteWarehouseButton({ id }: { id: string }) {
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
          const result = await deleteWarehouseAction(id);
          if ("error" in result) toast.error(result.error);
          else toast.success(tc("success"));
        });
      }}
    >
      {tc("delete")}
    </Button>
  );
}
