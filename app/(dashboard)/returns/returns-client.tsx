"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSaleReturnAction,
  createPurchaseReturnAction,
} from "../purchases/actions";

type Product = { id: string; name: string };

export function ReturnsClient({
  products,
  sales,
  purchases,
}: {
  products: Product[];
  sales: { id: string; invoiceNumber: string }[];
  purchases: { id: string; supplierName: string }[];
}) {
  const t = useTranslations("returns");
  const tc = useTranslations("common");
  const [saleItems, setSaleItems] = useState<{ productId: string; quantity: number; refundAmount: number }[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [pending, startTransition] = useTransition();

  function handleSaleReturn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saleItems.length === 0) return;
    const formData = new FormData(e.currentTarget);
    formData.set("items", JSON.stringify(saleItems));
    startTransition(async () => {
      const result = await createSaleReturnAction(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(tc("success"));
        setSaleItems([]);
      }
    });
  }

  function handlePurchaseReturn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (purchaseItems.length === 0) return;
    const formData = new FormData(e.currentTarget);
    formData.set("items", JSON.stringify(purchaseItems));
    startTransition(async () => {
      const result = await createPurchaseReturnAction(formData);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(tc("success"));
        setPurchaseItems([]);
      }
    });
  }

  return (
    <Tabs defaultValue="sales">
      <TabsList>
        <TabsTrigger value="sales">{t("salesReturn")}</TabsTrigger>
        <TabsTrigger value="purchases">{t("purchaseReturn")}</TabsTrigger>
      </TabsList>

      <TabsContent value="sales">
        <Card>
          <CardHeader><CardTitle>{t("salesReturn")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSaleReturn} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("relatedSale")}</Label>
                  <Select name="saleId" required>
                    <SelectTrigger><SelectValue placeholder={t("selectSale")} /></SelectTrigger>
                    <SelectContent>
                      {sales.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.invoiceNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tc("date")}</Label>
                  <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                </div>
              </div>
              {saleItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-end border p-3 rounded-lg">
                  <Select value={item.productId} onValueChange={(v) => {
                    setSaleItems((prev) => prev.map((x, idx) => idx === i ? { ...x, productId: v } : x));
                  }}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} value={item.quantity} onChange={(e) => {
                    setSaleItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: Number(e.target.value) } : x));
                  }} />
                  <Input type="number" step="0.01" value={item.refundAmount} onChange={(e) => {
                    setSaleItems((prev) => prev.map((x, idx) => idx === i ? { ...x, refundAmount: Number(e.target.value) } : x));
                  }} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSaleItems((prev) => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setSaleItems((prev) => [...prev, { productId: products[0]?.id ?? "", quantity: 1, refundAmount: 0 }])}>
                <Plus className="h-4 w-4 me-2" /> Add
              </Button>
              <Textarea name="notes" placeholder={tc("notes")} />
              <Button type="submit" disabled={pending}>{tc("save")}</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="purchases">
        <Card>
          <CardHeader><CardTitle>{t("purchaseReturn")}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePurchaseReturn} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("relatedPurchase")}</Label>
                  <Select name="purchaseId" required>
                    <SelectTrigger><SelectValue placeholder={t("selectPurchase")} /></SelectTrigger>
                    <SelectContent>
                      {purchases.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.supplierName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tc("date")}</Label>
                  <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                </div>
              </div>
              {purchaseItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-end border p-3 rounded-lg">
                  <Select value={item.productId} onValueChange={(v) => {
                    setPurchaseItems((prev) => prev.map((x, idx) => idx === i ? { ...x, productId: v } : x));
                  }}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} value={item.quantity} onChange={(e) => {
                    setPurchaseItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: Number(e.target.value) } : x));
                  }} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPurchaseItems((prev) => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setPurchaseItems((prev) => [...prev, { productId: products[0]?.id ?? "", quantity: 1 }])}>
                <Plus className="h-4 w-4 me-2" /> Add
              </Button>
              <Textarea name="notes" placeholder={tc("notes")} />
              <Button type="submit" disabled={pending}>{tc("save")}</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
