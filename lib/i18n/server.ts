const messages = {
  en: () => import("@/messages/en.json").then((m) => m.default),
  ar: () => import("@/messages/ar.json").then((m) => m.default),
};

export type Namespace =
  | "app"
  | "nav"
  | "common"
  | "auth"
  | "dashboard"
  | "pos"
  | "sales"
  | "products"
  | "warehouses"
  | "categories"
  | "transfers"
  | "movements"
  | "purchases"
  | "returns"
  | "customers"
  | "expenses"
  | "reports"
  | "repairs"
  | "programming"
  | "users"
  | "settings"
  | "invoice";

export async function getTranslator(locale: string, namespace: Namespace) {
  const msgs = await messages[locale === "ar" ? "ar" : "en"]();
  const ns = msgs[namespace] as Record<string, string>;
  return (key: string) => ns[key] ?? key;
}
