"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireUser, requireAdmin } from "@/lib/session";
import { updateUserLocale, updateShopSettings } from "@/lib/application/services/user-service";
import { shopSettingsSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/domain/action-result";

export async function setLocaleAction(locale: "ar" | "en"): Promise<ActionResult> {
  const user = await requireUser();
  await updateUserLocale(user.id, locale);
  const jar = await cookies();
  jar.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateShopSettingsAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const logoFile = formData.get("logo");
    let logoUrl: string | undefined;

    if (logoFile instanceof File && logoFile.size > 0) {
      const ext = logoFile.name.split(".").pop()?.toLowerCase() ?? "png";
      const allowed = ["png", "jpg", "jpeg", "webp"];
      if (!allowed.includes(ext)) {
        return { error: "Invalid image format" };
      }
      const bytes = Buffer.from(await logoFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const filename = `shop-logo.${ext === "jpeg" ? "jpg" : ext}`;
      await writeFile(path.join(uploadsDir, filename), bytes);
      logoUrl = `/uploads/${filename}`;
    }

    const parsed = shopSettingsSchema.safeParse({
      shopName: formData.get("shopName"),
      phone: formData.get("phone") || null,
      address: formData.get("address") || null,
      invoicePrefix: formData.get("invoicePrefix"),
      invoiceFooter: formData.get("invoiceFooter") || null,
      invoiceShowBarcode: formData.get("invoiceShowBarcode") === "on",
    });
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid data" };

    await updateShopSettings({
      ...parsed.data,
      ...(logoUrl ? { logoUrl } : {}),
    });
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error" };
  }
}
