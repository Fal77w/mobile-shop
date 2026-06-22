import { prisma } from "@/lib/prisma";
import { getDirection, getMessages } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";

export async function getUserPreferences(userId: string): Promise<{ locale: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });
  return { locale: user?.locale ?? "ar" };
}

export async function getIntlForUser(userId: string) {
  const { locale } = await getUserPreferences(userId);
  return {
    locale,
    dir: getDirection(locale),
    messages: getMessages(locale),
    money: (amount: number | string | { toNumber?: () => number }) => formatMoney(amount, locale),
  };
}
