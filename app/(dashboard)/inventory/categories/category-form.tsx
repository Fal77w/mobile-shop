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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "../actions";

export function CategoryFormDialog({
  warehouses,
  categories,
  category,
  trigger,
}: {
  warehouses: { id: string; name: string }[];
  categories?: { id: string; name: string; warehouseId: string }[];
  category?: { id: string; name: string; warehouseId: string; parentId?: string | null };
  trigger: React.ReactNode;
}) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(category.id, formData)
        : await createCategoryAction(formData);
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
          <DialogTitle>{category ? tc("edit") : t("addCategory")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tc("name")}</Label>
            <Input name="name" defaultValue={category?.name} required />
          </div>
          <div className="space-y-2">
            <Label>{t("warehouse")}</Label>
            <Select name="warehouseId" defaultValue={category?.warehouseId ?? warehouses[0]?.id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {categories && categories.length > 0 && (
            <div className="space-y-2">
              <Label>{t("parentCategory")}</Label>
              <Select name="parentId" defaultValue={category?.parentId ?? "none"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noParent")}</SelectItem>
                  {categories
                    .filter((c) => c.id !== category?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
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
          const result = await deleteCategoryAction(id);
          if ("error" in result) toast.error(result.error);
          else toast.success(tc("success"));
        });
      }}
    >
      {tc("delete")}
    </Button>
  );
}
