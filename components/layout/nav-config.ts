import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Package,
  Warehouse,
  Tags,
  ArrowLeftRight,
  Truck,
  RotateCcw,
  Users,
  Receipt,
  FileBarChart,
  Settings,
  UserCog,
  Wrench,
  History,
  Code2,
  type LucideIcon,
} from "lucide-react";
import { canManagePurchases, canManageSettings, canManageUsers } from "@/lib/permissions";

export type NavItemKey =
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
  | "settings";

export type NavGroup = "main" | "inventory" | "operations" | "analytics" | "admin";

export type NavItem = {
  href: string;
  key: NavItemKey;
  icon: LucideIcon;
  group: NavGroup;
  adminOnly?: boolean;
  accountantOnly?: boolean;
};

export const navGroups: NavGroup[] = ["main", "inventory", "operations", "analytics", "admin"];

export const navItems: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard, group: "main" },
  { href: "/pos", key: "pos", icon: ShoppingCart, group: "main" },
  { href: "/sales", key: "sales", icon: ReceiptText, group: "main" },
  { href: "/inventory/products", key: "products", icon: Package, group: "inventory" },
  { href: "/inventory/warehouses", key: "warehouses", icon: Warehouse, group: "inventory" },
  { href: "/inventory/categories", key: "categories", icon: Tags, group: "inventory" },
  { href: "/inventory/transfers", key: "transfers", icon: ArrowLeftRight, group: "inventory" },
  { href: "/inventory/movements", key: "movements", icon: History, group: "inventory" },
  { href: "/purchases", key: "purchases", icon: Truck, group: "operations", accountantOnly: true },
  { href: "/returns", key: "returns", icon: RotateCcw, group: "operations" },
  { href: "/customers", key: "customers", icon: Users, group: "operations" },
  { href: "/expenses", key: "expenses", icon: Receipt, group: "operations", accountantOnly: true },
  { href: "/repairs", key: "repairs", icon: Wrench, group: "operations" },
  { href: "/programming", key: "programming", icon: Code2, group: "operations" },
  { href: "/reports", key: "reports", icon: FileBarChart, group: "analytics" },
  { href: "/users", key: "users", icon: UserCog, group: "admin", adminOnly: true },
  { href: "/settings", key: "settings", icon: Settings, group: "admin", adminOnly: true },
];

export const mobileBottomNavKeys: NavItemKey[] = [
  "dashboard",
  "pos",
  "sales",
  "customers",
];

export function getNavItem(key: NavItemKey) {
  return navItems.find((item) => item.key === key)!;
}

export function getVisibleNavItems(role: Role) {
  return navItems.filter((item) => {
    if (item.adminOnly) return canManageUsers(role);
    if (item.accountantOnly) return canManagePurchases(role);
    return true;
  });
}

export function getGroupedNavItems(role: Role) {
  const visible = getVisibleNavItems(role);
  return navGroups
    .map((group) => ({
      group,
      items: visible.filter((item) => item.group === group),
    }))
    .filter((g) => g.items.length > 0);
}
