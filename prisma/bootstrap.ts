import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = ["سامسونج", "أبل", "شاومي", "إكسسوارات", "برمجة"];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Error: ${name} is required in .env to create the first admin user.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Admin user already exists — bootstrap skipped.");
    return;
  }

  const email = requireEnv("ADMIN_EMAIL");
  const password = requireEnv("ADMIN_PASSWORD");

  if (password.length < 6) {
    console.error("Error: ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  const locale = process.env.ADMIN_LOCALE?.trim() === "en" ? "en" : "ar";
  const name = process.env.ADMIN_NAME?.trim() || (locale === "ar" ? "مدير المتجر" : "Shop Admin");
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "ADMIN",
        locale,
      },
    });

    await tx.shopSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        shopName: "متجر الموبايلات",
        invoicePrefix: "INV",
      },
      update: {},
    });

    const mainWarehouse = await tx.warehouse.create({
      data: { name: "المستودع الرئيسي" },
    });

    await tx.warehouse.create({
      data: { name: "مستودع الإكسسوارات" },
    });

    for (const cat of CATEGORIES) {
      await tx.category.create({
        data: { name: cat, warehouseId: mainWarehouse.id },
      });
    }
  });

  console.log(`Admin user created: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
