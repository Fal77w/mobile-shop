"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { transferStockAction } from "../actions";

export function TransferFormDialog({
  warehouses,
  products,
  trigger,
}: {
  warehouses: { id: string; name: string }[];
  products: { id: string; name: string; warehouseId: string; quantity: number }[];
  trigger: React.ReactNode;
}) {
  const t = useTranslations("transfers");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState(warehouses[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const sourceProducts = products.filter((p) => p.warehouseId === fromId && p.quantity > 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("fromWarehouseId", fromId);
    startTransition(async () => {
      const result = await transferStockAction(formData);
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
          <DialogTitle>{t("newTransfer")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("from")}</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("to")}</Label>
            <Select name="toWarehouseId">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {warehouses.filter((w) => w.id !== fromId).map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("product")}</Label>
            <Select name="productId">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {sourceProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{tc("quantity")}</Label>
            <Input name="quantity" type="number" min={1} required />
          </div>
          <div className="space-y-2">
            <Label>{tc("notes")}</Label>
            <Textarea name="notes" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
