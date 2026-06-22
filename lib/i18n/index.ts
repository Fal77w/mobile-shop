import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

export type Messages = typeof en;
export type Locale = "en" | "ar";

const messages: Record<Locale, Messages> = { en, ar };

export function getMessages(locale: string): Messages {
  return messages[locale === "ar" ? "ar" : "en"];
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
