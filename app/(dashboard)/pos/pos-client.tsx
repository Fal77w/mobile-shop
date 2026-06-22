"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Banknote, CreditCard, Minus, Plus, Search, Trash2, UserRound } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { completeSaleAction } from "./actions";
import { formatMoney } from "@/lib/utils";

export type PosProduct = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: string | number;
  quantity: number;
  category: { name: string };
  warehouse: { name: string };
};

type CartItem = {
  productId: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  maxQuantity: number;
};

type PosClientProps = {
  products: PosProduct[];
  categories: string[];
  customers: { id: string; name: string }[];
  locale: string;
  title?: string;
  subtitle?: string;
  hideCategoryTabs?: boolean;
};

export function PosClient({
  products,
  categories,
  customers,
  locale,
  title,
  subtitle,
  hideCategoryTabs = false,
}: PosClientProps) {
  const t = useTranslations("pos");
  const tc = useTranslations("common");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "ON_ACCOUNT">("CASH");
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [pending, startTransition] = useTransition();

  const categoryLabel = useCallback(
    (name: string) => {
      const known = ["Samsung", "Apple", "Xiaomi", "Accessories", "Programming"] as const;
      if ((known as readonly string[]).includes(name)) {
        return t(`categoryNames.${name}` as "categoryNames.Samsung");
      }
      return name;
    },
    [t]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "all" || p.category.name === activeCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  const addToCart = useCallback((product: PosProduct) => {
    const price = Number(product.sellingPrice);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sellingPrice: price,
          quantity: 1,
          maxQuantity: product.quantity,
        },
      ];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const qty = i.quantity + delta;
          if (qty <= 0) return null;
          if (qty > i.maxQuantity) return i;
          return { ...i, quantity: qty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function handleComplete() {
    if (cart.length === 0) return;
    if (paymentMethod === "ON_ACCOUNT" && !customerId) {
      toast.error(t("selectCustomer"));
      return;
    }

    const formData = new FormData();
    formData.set(
      "items",
      JSON.stringify(cart.map((i) => ({ productId: i.productId, quantity: i.quantity })))
    );
    formData.set("paymentMethod", paymentMethod);
    if (customerId) formData.set("customerId", customerId);
    if (customerName) formData.set("customerName", customerName);

    startTransition(async () => {
      const result = await completeSaleAction(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(t("saleComplete"));
      setCart([]);
      setCustomerId("");
      setCustomerName("");
      setPaymentMethod("CASH");
      router.push(`/pos/sales/${result.id}`);
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader title={title ?? t("title")} description={subtitle} />

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 ps-9 text-base"
              placeholder={t("searchProducts")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {!hideCategoryTabs && categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                type="button"
                size="sm"
                variant={activeCategory === "all" ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => setActiveCategory("all")}
              >
                {t("allCategories")}
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  size="sm"
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="shrink-0 rounded-full"
                  onClick={() => setActiveCategory(cat)}
                >
                  {categoryLabel(cat)}
                </Button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {t("noProducts")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p) => {
                const inCart = cart.find((i) => i.productId === p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className={cn(
                      "flex min-h-[110px] flex-col rounded-xl border bg-card p-3 text-start transition-all touch-manipulation",
                      "hover:border-primary hover:shadow-sm active:scale-[0.98]",
                      inCart && "border-primary ring-2 ring-primary/20"
                    )}
                  >
                    <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug">
                      {p.name}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-1">
                      <p className="text-base font-bold text-primary">
                        {formatMoney(p.sellingPrice, locale)}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {p.quantity}
                      </Badge>
                    </div>
                    {inCart ? (
                      <p className="mt-1 text-[11px] font-medium text-primary">
                        {t("inCart", { count: inCart.quantity })}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-muted-foreground">{t("tapToAdd")}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Card className="xl:sticky xl:top-[calc(var(--header-height)+1rem)] xl:self-start">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">
              {t("cart")}{" "}
              {cartCount > 0 && (
                <Badge variant="default" className="ms-1">
                  {cartCount}
                </Badge>
              )}
            </CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
                {t("clearCart")}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-lg border border-dashed py-10 text-center">
                <p className="text-sm text-muted-foreground">{t("emptyCartHint")}</p>
              </div>
            ) : (
              <div className="max-h-[240px] space-y-2 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(item.sellingPrice, locale)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQty(item.productId, -1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQty(item.productId, 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="text-2xl font-bold">{formatMoney(subtotal, locale)}</span>
              </div>

              <div className="space-y-2">
                <Label>{t("paymentMethod")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "CASH", label: t("cash"), icon: Banknote },
                      { value: "CARD", label: t("card"), icon: CreditCard },
                      { value: "ON_ACCOUNT", label: t("onAccount"), icon: UserRound },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      type="button"
                      variant={paymentMethod === value ? "default" : "outline"}
                      className="h-auto flex-col gap-1 py-3 text-xs"
                      onClick={() => setPaymentMethod(value)}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {paymentMethod === "ON_ACCOUNT" && (
                <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <Label>{t("selectCustomer")} *</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCustomer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("customerName")}</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t("customerNamePlaceholder")}
                />
              </div>

              <Button
                className="h-12 w-full text-base font-semibold"
                size="lg"
                disabled={pending || cart.length === 0}
                onClick={handleComplete}
              >
                {pending ? tc("loading") : t("completeSale")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
