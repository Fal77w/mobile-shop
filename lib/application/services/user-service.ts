import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      locale: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    },
  });
}

export async function deleteUser(id: string, currentUserId: string) {
  if (id === currentUserId) throw new Error("Cannot delete your own account");
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const user = await prisma.user.findUnique({ where: { id } });
  if (user?.role === "ADMIN" && adminCount <= 1) {
    throw new Error("Cannot delete the last admin");
  }
  return prisma.user.delete({ where: { id } });
}

export async function getShopSettings() {
  return prisma.shopSettings.findUnique({ where: { id: "default" } });
}

export async function updateShopSettings(data: {
  shopName: string;
  phone?: string | null;
  address?: string | null;
  invoicePrefix: string;
  logoUrl?: string | null;
  invoiceFooter?: string | null;
  invoiceShowBarcode?: boolean;
}) {
  return prisma.shopSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...data,
      phone: data.phone ?? null,
      address: data.address ?? null,
      logoUrl: data.logoUrl ?? null,
      invoiceFooter: data.invoiceFooter ?? null,
      invoiceShowBarcode: data.invoiceShowBarcode ?? true,
    },
    update: {
      ...data,
      phone: data.phone ?? null,
      address: data.address ?? null,
      logoUrl: data.logoUrl ?? null,
      invoiceFooter: data.invoiceFooter ?? null,
    },
  });
}

export async function updateUserLocale(userId: string, locale: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { locale: locale === "en" ? "en" : "ar" },
  });
}
