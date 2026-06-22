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
import { createProductAction, updateProductAction } from "@/app/(dashboard)/inventory/actions";

type Warehouse = { id: string; name: string };
type Category = { id: string; name: string; warehouseId: string };
type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string;
  warehouseId: string;
  costPrice: unknown;
  sellingPrice: unknown;
  quantity: number;
  lowStockAlert: number;
};

export function ProductFormDialog({
  warehouses,
  categories,
  product,
  trigger,
  canEditCost = true,
}: {
  warehouses: Warehouse[];
  categories: Category[];
  product?: Product;
  trigger: React.ReactNode;
  canEditCost?: boolean;
}) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState(product?.warehouseId ?? warehouses[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const filteredCategories = categories.filter((c) => c.warehouseId === warehouseId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("warehouseId", warehouseId);

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, formData)
        : await createProductAction(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(tc("success"));
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? t("editProduct") : t("addProduct")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{tc("name")}</Label>
            <Input name="name" defaultValue={product?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("sku")}</Label>
              <Input
                name="sku"
                defaultValue={product?.sku}
                placeholder={t("skuAuto")}
                disabled={!!product}
              />
              {!product && (
                <p className="text-xs text-muted-foreground">{t("skuAutoHint")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("barcode")}</Label>
              <Input name="barcode" defaultValue={product?.barcode ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("warehouse")}</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select name="categoryId" defaultValue={product?.categoryId ?? filteredCategories[0]?.id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {canEditCost ? (
              <>
                <div className="space-y-2">
                  <Label>{t("costPrice")}</Label>
                  <Input name="costPrice" type="number" step="0.01" defaultValue={product ? Number(product.costPrice) : 0} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("sellingPrice")}</Label>
                  <Input name="sellingPrice" type="number" step="0.01" defaultValue={product ? Number(product.sellingPrice) : 0} required />
                </div>
              </>
            ) : (
              <>
                <input type="hidden" name="costPrice" value={product ? Number(product.costPrice) : 0} />
                <div className="space-y-2 col-span-2">
                  <Label>{t("sellingPrice")}</Label>
                  <Input name="sellingPrice" type="number" step="0.01" defaultValue={product ? Number(product.sellingPrice) : 0} required />
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("stock")}</Label>
              <Input name="quantity" type="number" defaultValue={product?.quantity ?? 0} required />
            </div>
            <div className="space-y-2">
              <Label>{t("lowStockAlert")}</Label>
              <Input name="lowStockAlert" type="number" defaultValue={product?.lowStockAlert ?? 5} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
