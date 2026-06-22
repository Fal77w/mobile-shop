import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | string | { toNumber?: () => number }, locale = "ar"): string {
  const value =
    typeof amount === "object" && amount !== null && "toNumber" in amount
      ? (amount as { toNumber: () => number }).toNumber()
      : typeof amount === "number"
        ? amount
        : parseFloat(String(amount)) || 0;

  const normalized = Math.round(value * 100) / 100;
  const localeTag = locale === "ar" ? "ar-SA" : "en-US";

  if (Number.isInteger(normalized) || normalized % 1 === 0) {
    return new Intl.NumberFormat(localeTag, {
      numberingSystem: "latn",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalized);
  }

  const formatted = new Intl.NumberFormat(localeTag, {
    numberingSystem: "latn",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(normalized);

  return formatted.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function formatDate(date: Date | string, locale = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return parseFloat(String(value)) || 0;
}

export function decimal(value: number): string {
  return value.toFixed(2);
}
