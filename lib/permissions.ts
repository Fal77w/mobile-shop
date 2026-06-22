import type { Role } from "@prisma/client";

export type AppRole = "ADMIN" | "ACCOUNTANT" | "SALES";

export function normalizeRole(role: Role): AppRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "ACCOUNTANT") return "ACCOUNTANT";
  return "SALES";
}

export function canViewFinancials(role: Role): boolean {
  const r = normalizeRole(role);
  return r === "ADMIN" || r === "ACCOUNTANT";
}

export function canEditCostPrice(role: Role): boolean {
  const r = normalizeRole(role);
  return r === "ADMIN" || r === "ACCOUNTANT";
}

export function canAccessReports(role: Role): boolean {
  return true;
}

export function canViewProfitReports(role: Role): boolean {
  return normalizeRole(role) === "ADMIN";
}

export function canManageBackup(role: Role): boolean {
  return normalizeRole(role) === "ADMIN";
}

export function canManagePurchases(role: Role): boolean {
  const r = normalizeRole(role);
  return r === "ADMIN" || r === "ACCOUNTANT";
}

export function canManageExpenses(role: Role): boolean {
  return canManagePurchases(role);
}

export function canManageUsers(role: Role): boolean {
  return normalizeRole(role) === "ADMIN";
}

export function canManageSettings(role: Role): boolean {
  return normalizeRole(role) === "ADMIN";
}
