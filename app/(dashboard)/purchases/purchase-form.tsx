"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPurchaseAction } from "./actions";

type Product = { id: string; name: string; costPrice: unknown };

type LineItem = { productId: string; quantity: number; costPrice: number };

export function PurchaseFormClient({ products }: { products: Product[] }) {
  const t = useTranslations("purchases");
  const tc = useTranslations("common");
  const [items, setItems] = useState<LineItem[]>([]);
  const [pending, startTransition] = useTransition();

  function addItem() {
    const p = products[0];
    if (!p) return;
    setItems((prev) => [
      ...prev,
      { productId: p.id, quantity: 1, costPrice: Number(p.costPrice) },
    ]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    const formData = new FormData(e.currentTarget);
    formData.set("items", JSON.stringify(items));
    startTransition(async () => {
      const result = await createPurchaseAction(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(tc("success"));
        setItems([]);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("newPurchase")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("supplier")}</Label>
              <Input name="supplierName" required />
            </div>
            <div className="space-y-2">
              <Label>{t("invoiceNo")}</Label>
              <Input name="supplierInvoiceNo" />
            </div>
            <div className="space-y-2">
              <Label>{tc("date")}</Label>
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(v) => {
                      const p = products.find((x) => x.id === v);
                      updateItem(index, "productId", v);
                      if (p) updateItem(index, "costPrice", Number(p.costPrice));
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tc("quantity")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.costPrice}
                    onChange={(e) => updateItem(index, "costPrice", Number(e.target.value))}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 me-2" />
              {t("addItem")}
            </Button>
          </div>

          <Button type="submit" disabled={pending || items.length === 0}>
            {pending ? tc("loading") : tc("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
