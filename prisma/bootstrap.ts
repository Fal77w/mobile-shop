import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const name = process.env.ADMIN_NAME?.trim() || "Shop Admin";
  const locale = process.env.ADMIN_LOCALE?.trim() === "en" ? "en" : "ar";
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
      data: { name: "Main Warehouse" },
    });

    await tx.warehouse.create({
      data: { name: "Accessories Warehouse" },
    });

    const categories = ["Samsung", "Apple", "Xiaomi", "Accessories", "Programming"];
    for (const cat of categories) {
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
