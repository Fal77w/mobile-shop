import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  locale: string;
  role: Role;
};

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, locale: true, role: true },
  });
  if (!user) {
    redirect("/logout");
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function requireAccountantOrAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "ACCOUNTANT") {
    redirect("/dashboard");
  }
  return user;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, locale: true, role: true },
  });
  return user;
}
