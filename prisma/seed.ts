import { PrismaClient, PaymentMethod, RepairStatus, Role, StockMovementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CAT = {
  SAMSUNG: "سامسونج",
  APPLE: "أبل",
  XIAOMI: "شاومي",
  ACCESSORIES: "إكسسوارات",
  PROGRAMMING: "برمجة",
} as const;

const DEFAULT_CATEGORIES = Object.values(CAT);

const LEGACY_CATEGORIES: Record<string, string> = {
  Samsung: CAT.SAMSUNG,
  Apple: CAT.APPLE,
  Xiaomi: CAT.XIAOMI,
  Accessories: CAT.ACCESSORIES,
  Programming: CAT.PROGRAMMING,
};

const WAREHOUSE_MAIN = "المستودع الرئيسي";
const WAREHOUSE_ACCESSORIES = "مستودع الإكسسوارات";

const SUPPLIERS = [
  "مورد سامسونج الرئيسي",
  "موزع أبل الشرق الأوسط",
  "شركة شاومي للتجارة",
  "مستودع الإكسسوارات",
  "تقنية الجزيرة",
];

const EXPENSE_TITLES = [
  { title: "إيجار المحل", amount: 3500, day: 1 },
  { title: "فاتورة الكهرباء", amount: 450, day: 5 },
  { title: "رواتب الموظفين", amount: 4200, day: 28 },
  { title: "إنترنت واتصالات", amount: 180, day: 10 },
  { title: "صيانة المحل", amount: 320, day: 15 },
  { title: "تسويق وإعلانات", amount: 600, day: 20 },
];

const CUSTOMERS = [
  { name: "أحمد محمد الحربي", phone: "0501234567" },
  { name: "فاطمة علي الزهراني", phone: "0559876543" },
  { name: "خالد سعيد القحطاني", phone: "0531112233" },
  { name: "نورة عبدالله الشمري", phone: "0544445566" },
  { name: "محمد فهد العتيبي", phone: "0567778899" },
  { name: "سارة إبراهيم الدوسري", phone: "0503334455" },
  { name: "عبدالرحمن يوسف الغامدي", phone: "0556667788" },
  { name: "ريم حسن المطيري", phone: "0539990011" },
  { name: "يوسف عمر البقمي", phone: "0542223344" },
  { name: "هند سالم العنزي", phone: "0508889900" },
  { name: "فيصل ناصر الحارثي", phone: "0551112233" },
  { name: "منى كريم السبيعي", phone: "0534445566" },
  { name: "تركي بندر الرشيد", phone: "0565556677" },
  { name: "لينا وليد الجهني", phone: "0507778899" },
  { name: "بدر راشد الفهد", phone: "0553334455" },
  { name: "مريم طارق الشهري", phone: "0536667788" },
  { name: "سعود حمد المالكي", phone: "0549990011" },
  { name: "دانة فيصل العمري", phone: "0502223344" },
  { name: "راكان مشعل الثبيتي", phone: "0558889900" },
  { name: "جواهر عبدالعزيز", phone: "0531119900" },
  { name: "عبدالله نايف الحكمي", phone: "0504445566" },
  { name: "لمى سعد العسيري", phone: "0557778899" },
  { name: "ماجد حمود الزهراني", phone: "0532223344" },
  { name: "شهد فهد القرني", phone: "0546667788" },
  { name: "عمر سلمان البلوي", phone: "0509990011" },
  { name: "غادة نايف الحربي", phone: "0554445566" },
  { name: "سلطان مشعل الدوسري", phone: "0537778899" },
  { name: "أمل خالد الشهري", phone: "0541112233" },
  { name: "حسن يوسف المالكي", phone: "0506667788" },
  { name: "نوف عبدالرحمن", phone: "0559990011" },
  { name: "وليد إبراهيم العتيبي", phone: "0533334455" },
  { name: "رنا محمد السبيعي", phone: "0548889900" },
  { name: "زياد فهد الحارثي", phone: "0501112233" },
  { name: "هيا سالم القحطاني", phone: "0554449900" },
  { name: "بندر ناصر الجهني", phone: "0535556677" },
  { name: "العنود تركي الشمري", phone: "0543334455" },
  { name: "مشعل راشد العنزي", phone: "0507770011" },
  { name: "شروق فيصل الغامدي", phone: "0552223344" },
  { name: "إبراهيم حمد الثبيتي", phone: "0538889900" },
];

type ProductSeed = {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  warehouse: "main" | "accessories";
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockAlert: number;
};

const PRODUCT_CATALOG: ProductSeed[] = [
  { name: "سامسونج جالكسي S24 ألترا", sku: "SAM-S24U", barcode: "8801001001", category: CAT.SAMSUNG, warehouse: "main", costPrice: 3200, sellingPrice: 3650, quantity: 4, lowStockAlert: 2 },
  { name: "سامسونج جالكسي A54", sku: "SAM-A54", barcode: "8801001002", category: CAT.SAMSUNG, warehouse: "main", costPrice: 800, sellingPrice: 950, quantity: 12, lowStockAlert: 3 },
  { name: "سامسونج جالكسي A05", sku: "SAM-A05", barcode: "8801001003", category: CAT.SAMSUNG, warehouse: "main", costPrice: 280, sellingPrice: 350, quantity: 25, lowStockAlert: 5 },
  { name: "سامسونج جالكسي تاب A8", sku: "SAM-TABA8", category: CAT.SAMSUNG, warehouse: "main", costPrice: 650, sellingPrice: 780, quantity: 6, lowStockAlert: 2 },
  { name: "سامسونج جالكسي بودز 2", sku: "SAM-BUDS2", category: CAT.SAMSUNG, warehouse: "main", costPrice: 180, sellingPrice: 240, quantity: 15, lowStockAlert: 4 },
  { name: "آيفون 15 برو ماكس", sku: "APL-15PM", barcode: "1901002001", category: CAT.APPLE, warehouse: "main", costPrice: 4200, sellingPrice: 4800, quantity: 3, lowStockAlert: 1 },
  { name: "آيفون 15", sku: "APL-15", barcode: "1901002002", category: CAT.APPLE, warehouse: "main", costPrice: 2800, sellingPrice: 3200, quantity: 5, lowStockAlert: 2 },
  { name: "آيفون 14", sku: "APL-14", barcode: "1901002003", category: CAT.APPLE, warehouse: "main", costPrice: 2200, sellingPrice: 2550, quantity: 7, lowStockAlert: 2 },
  { name: "آيفون 13", sku: "APL-13", category: CAT.APPLE, warehouse: "main", costPrice: 1800, sellingPrice: 2100, quantity: 4, lowStockAlert: 2 },
  { name: "إيربودز برو 2", sku: "APL-APP2", category: CAT.APPLE, warehouse: "main", costPrice: 650, sellingPrice: 820, quantity: 10, lowStockAlert: 3 },
  { name: "شاومي ريدمي نوت 13 برو", sku: "XIA-RN13P", barcode: "6901003001", category: CAT.XIAOMI, warehouse: "main", costPrice: 720, sellingPrice: 880, quantity: 14, lowStockAlert: 4 },
  { name: "شاومي ريدمي نوت 13", sku: "XIA-RN13", barcode: "6901003002", category: CAT.XIAOMI, warehouse: "main", costPrice: 580, sellingPrice: 720, quantity: 18, lowStockAlert: 5 },
  { name: "شاومي بوكو X6 برو", sku: "XIA-PX6P", category: CAT.XIAOMI, warehouse: "main", costPrice: 890, sellingPrice: 1050, quantity: 8, lowStockAlert: 3 },
  { name: "شاومي ريدمي A3", sku: "XIA-RA3", category: CAT.XIAOMI, warehouse: "main", costPrice: 220, sellingPrice: 290, quantity: 30, lowStockAlert: 8 },
  { name: "شاومي سمارت باند 8", sku: "XIA-SB8", category: CAT.XIAOMI, warehouse: "main", costPrice: 120, sellingPrice: 165, quantity: 22, lowStockAlert: 6 },
  { name: "غطاء سيليكون آيفون 15", sku: "ACC-IP15C", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 8, sellingPrice: 25, quantity: 45, lowStockAlert: 10 },
  { name: "غطاء شفاف سامسونج A54", sku: "ACC-SA54C", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 5, sellingPrice: 18, quantity: 60, lowStockAlert: 15 },
  { name: "شاحن سريع USB-C 25 واط", sku: "ACC-CH25", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 12, sellingPrice: 35, quantity: 80, lowStockAlert: 20 },
  { name: "زجاج حماية آيفون 15", sku: "ACC-TG15", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 3, sellingPrice: 15, quantity: 100, lowStockAlert: 25 },
  { name: "زجاج حماية سامسونج S24", sku: "ACC-TGS24", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 3, sellingPrice: 15, quantity: 55, lowStockAlert: 15 },
  { name: "سماعات لاسلكية TWS", sku: "ACC-TWS", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 35, sellingPrice: 75, quantity: 35, lowStockAlert: 8 },
  { name: "بطارية متنقلة 20000 مللي", sku: "ACC-PB20", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 45, sellingPrice: 95, quantity: 28, lowStockAlert: 6 },
  { name: "حامل جوال للسيارة", sku: "ACC-CARH", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 15, sellingPrice: 40, quantity: 40, lowStockAlert: 10 },
  { name: "كابل لايتنينج 2 متر", sku: "ACC-LGT2", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 6, sellingPrice: 20, quantity: 2, lowStockAlert: 5 },
  { name: "كابل USB-C 2 متر", sku: "ACC-USBC2", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 5, sellingPrice: 18, quantity: 3, lowStockAlert: 5 },
  { name: "حلقة حامل للجوال", sku: "ACC-RING", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 2, sellingPrice: 10, quantity: 1, lowStockAlert: 5 },
  { name: "خدمة فك قفل البرمجيات", sku: "PRG-UNLK", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 0, sellingPrice: 150, quantity: 999, lowStockAlert: 0 },
  { name: "خدمة تجاوز FRP", sku: "PRG-FRP", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 0, sellingPrice: 80, quantity: 999, lowStockAlert: 0 },
  { name: "خدمة استرجاع البيانات", sku: "PRG-RECV", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 0, sellingPrice: 200, quantity: 999, lowStockAlert: 0 },
  { name: "أجور تبديل الشاشة", sku: "PRG-SCRN", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 50, sellingPrice: 120, quantity: 999, lowStockAlert: 0 },
  { name: "سامسونج جالكسي S23", sku: "SAM-S23", barcode: "8801001004", category: CAT.SAMSUNG, warehouse: "main", costPrice: 2400, sellingPrice: 2750, quantity: 6, lowStockAlert: 2 },
  { name: "سامسونج جالكسي A15", sku: "SAM-A15", category: CAT.SAMSUNG, warehouse: "main", costPrice: 350, sellingPrice: 420, quantity: 20, lowStockAlert: 5 },
  { name: "سامسونج جالكسي واتش 6", sku: "SAM-W6", category: CAT.SAMSUNG, warehouse: "main", costPrice: 750, sellingPrice: 920, quantity: 8, lowStockAlert: 2 },
  { name: "آيفون 12", sku: "APL-12", category: CAT.APPLE, warehouse: "main", costPrice: 1500, sellingPrice: 1800, quantity: 5, lowStockAlert: 2 },
  { name: "آيفون SE 2022", sku: "APL-SE22", category: CAT.APPLE, warehouse: "main", costPrice: 1100, sellingPrice: 1350, quantity: 7, lowStockAlert: 2 },
  { name: "آيباد الجيل العاشر", sku: "APL-IPAD10", category: CAT.APPLE, warehouse: "main", costPrice: 1400, sellingPrice: 1680, quantity: 4, lowStockAlert: 1 },
  { name: "شاومي 14 ألترا", sku: "XIA-14U", category: CAT.XIAOMI, warehouse: "main", costPrice: 2800, sellingPrice: 3200, quantity: 3, lowStockAlert: 1 },
  { name: "شاومي ريدمي 13C", sku: "XIA-R13C", category: CAT.XIAOMI, warehouse: "main", costPrice: 380, sellingPrice: 460, quantity: 22, lowStockAlert: 6 },
  { name: "شريحة STC 5G", sku: "SIM-STC5G", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 0, sellingPrice: 25, quantity: 200, lowStockAlert: 30 },
  { name: "شريحة موبايلي", sku: "SIM-MOB", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 0, sellingPrice: 20, quantity: 150, lowStockAlert: 25 },
  { name: "شريحة زين", sku: "SIM-ZAIN", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 0, sellingPrice: 22, quantity: 180, lowStockAlert: 30 },
  { name: "ذاكرة خارجية 128 جيجا", sku: "ACC-MC128", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 35, sellingPrice: 65, quantity: 50, lowStockAlert: 10 },
  { name: "ذاكرة خارجية 256 جيجا", sku: "ACC-MC256", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 65, sellingPrice: 110, quantity: 35, lowStockAlert: 8 },
  { name: "سماعة بلوتوث صغيرة", sku: "ACC-BTSPK", category: CAT.ACCESSORIES, warehouse: "accessories", costPrice: 28, sellingPrice: 55, quantity: 25, lowStockAlert: 6 },
  { name: "خدمة فك حساب الجهاز", sku: "PRG-ACC", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 0, sellingPrice: 100, quantity: 999, lowStockAlert: 0 },
  { name: "خدمة تفليش وتحديث نظام", sku: "PRG-FLSH", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 0, sellingPrice: 90, quantity: 999, lowStockAlert: 0 },
  { name: "خدمة فك شريحة الشبكة", sku: "PRG-NET", category: CAT.PROGRAMMING, warehouse: "main", costPrice: 0, sellingPrice: 120, quantity: 999, lowStockAlert: 0 },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function dec(n: number): string {
  return n.toFixed(2);
}

async function findOrRenameWarehouse(arName: string, legacyName: string) {
  let wh = await prisma.warehouse.findFirst({ where: { name: arName } });
  if (!wh) {
    const legacy = await prisma.warehouse.findFirst({ where: { name: legacyName } });
    if (legacy) {
      wh = await prisma.warehouse.update({ where: { id: legacy.id }, data: { name: arName } });
    } else {
      wh = await prisma.warehouse.create({ data: { name: arName } });
    }
  }
  return wh;
}

async function ensureCategory(warehouseId: string, arName: string) {
  const legacyName = Object.entries(LEGACY_CATEGORIES).find(([, v]) => v === arName)?.[0];
  if (legacyName) {
    const legacy = await prisma.category.findFirst({
      where: { warehouseId, name: legacyName },
    });
    if (legacy) {
      await prisma.category.update({ where: { id: legacy.id }, data: { name: arName } });
      return;
    }
  }
  await prisma.category.upsert({
    where: { warehouseId_name: { warehouseId, name: arName } },
    create: { name: arName, warehouseId },
    update: {},
  });
}

async function ensureShopDefaults() {
  await prisma.shopSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      shopName: "متجر النخبة للموبايلات",
      phone: "0501234567",
      address: "صنعاء - شارع حدة - مقابل البنك الأهلي",
      invoicePrefix: "INV",
    },
    update: {
      shopName: "متجر النخبة للموبايلات",
      phone: "0501234567",
      address: "صنعاء - شارع حدة - مقابل البنك الأهلي",
    },
  });

  let mainWh = await findOrRenameWarehouse(WAREHOUSE_MAIN, "Main Warehouse");
  let accWh = await findOrRenameWarehouse(WAREHOUSE_ACCESSORIES, "Accessories Warehouse");

  for (const wh of [mainWh, accWh]) {
    for (const name of DEFAULT_CATEGORIES) {
      await ensureCategory(wh.id, name);
    }
  }

  const categoryMap = new Map<string, string>();
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    categoryMap.set(`${c.warehouseId}:${c.name}`, c.id);
  }

  return { mainWh, accWh, categoryMap };
}

async function ensureUsers() {
  let admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!admin) {
    admin = await prisma.user.findFirst();
  }
  if (!admin) throw new Error("No user found — run bootstrap first (npm run db:bootstrap)");

  let employee = await prisma.user.findFirst({ where: { role: Role.EMPLOYEE } });
  if (!employee) {
    employee = await prisma.user.create({
      data: {
        email: "employee@demo.shop",
        passwordHash: await bcrypt.hash("employee123", 12),
        name: "محمد الموظف",
        role: Role.EMPLOYEE,
        locale: "ar",
      },
    });
  }

  return { admin, employee };
}

async function wipeTransactionalData() {
  await prisma.saleReturnItem.deleteMany();
  await prisma.saleReturn.deleteMany();
  await prisma.purchaseReturnItem.deleteMany();
  await prisma.purchaseReturn.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.repairOrder.deleteMany();
  await prisma.programmingOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.invoiceSequence.deleteMany();
}

async function seedProducts(
  mainWh: { id: string },
  accWh: { id: string },
  categoryMap: Map<string, string>
) {
  const products = [];
  for (const p of PRODUCT_CATALOG) {
    const warehouseId = p.warehouse === "main" ? mainWh.id : accWh.id;
    const categoryId = categoryMap.get(`${warehouseId}:${p.category}`);
    if (!categoryId) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        barcode: p.barcode ?? null,
        categoryId,
        warehouseId,
        costPrice: dec(p.costPrice),
        sellingPrice: dec(p.sellingPrice),
        quantity: p.quantity,
        lowStockAlert: p.lowStockAlert,
        createdAt: daysAgo(85 + Math.floor(Math.random() * 5)),
      },
    });
    products.push(product);
  }
  return products;
}

async function seedCustomers() {
  const customers = [];
  for (const c of CUSTOMERS) {
    customers.push(
      await prisma.customer.create({
        data: { name: c.name, phone: c.phone, totalDebt: 0 },
      })
    );
  }
  return customers;
}

async function seedPurchases(
  products: { id: string; costPrice: { toNumber?: () => number } | number | string }[],
  userIds: string[]
) {
  const purchases = [];
  for (let i = 0; i < 50; i++) {
    const date = dateOnly(daysAgo(5 + i * 5));
    const itemCount = 2 + Math.floor(Math.random() * 4);
    const selected = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount);
    let total = 0;
    const items = selected.map((p) => {
      const qty = 5 + Math.floor(Math.random() * 20);
      const cost = typeof p.costPrice === "object" && p.costPrice && "toNumber" in p.costPrice
        ? (p.costPrice as { toNumber: () => number }).toNumber()
        : Number(p.costPrice);
      const lineTotal = cost * qty;
      total += lineTotal;
      return { productId: p.id, quantity: qty, costPrice: dec(cost), lineTotal: dec(lineTotal) };
    });

    const purchase = await prisma.purchase.create({
      data: {
        supplierName: pick(SUPPLIERS),
        supplierInvoiceNo: `SUP-${2025}-${String(100 + i).padStart(4, "0")}`,
        date,
        total: dec(total),
        createdById: pick(userIds),
        createdAt: date,
        items: { create: items },
      },
    });
    purchases.push(purchase);
  }
  return purchases;
}

async function seedExpenses() {
  let count = 0;
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    for (const exp of EXPENSE_TITLES) {
      const d = new Date();
      d.setMonth(d.getMonth() - monthOffset);
      d.setDate(exp.day);
      await prisma.expense.create({
        data: {
          title: exp.title,
          amount: dec(exp.amount + Math.floor(Math.random() * 100) - 50),
          date: dateOnly(d),
          notes: monthOffset === 0 ? "الشهر الحالي" : null,
        },
      });
      count++;
    }
  }
  return count;
}

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: { toNumber?: () => number } | number | string;
  costPrice: { toNumber?: () => number } | number | string;
};

function price(p: ProductRow, field: "sellingPrice" | "costPrice"): number {
  const v = p[field];
  if (typeof v === "object" && v && "toNumber" in v) return (v as { toNumber: () => number }).toNumber();
  return Number(v);
}

async function seedSales(
  products: ProductRow[],
  customers: { id: string; name: string }[],
  userIds: string[]
) {
  const paymentMethods: PaymentMethod[] = ["CASH", "CARD", "ON_ACCOUNT"];
  const weights = [0.55, 0.25, 0.2];
  let invoiceCounter2025 = 0;
  let invoiceCounter2026 = 0;
  const salesCreated: { id: string; total: number; paymentMethod: PaymentMethod; customerId: string | null; createdAt: Date }[] = [];

  for (let day = 180; day >= 0; day--) {
    const salesToday = day === 0 ? 5 + Math.floor(Math.random() * 6) : 2 + Math.floor(Math.random() * 8);
    if (day % 7 === 5) continue;

    for (let s = 0; s < salesToday; s++) {
      const createdAt = daysAgo(day);
      const itemCount = 1 + Math.floor(Math.random() * 3);
      const selected = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount);

      let subtotal = 0;
      const items = selected.map((p) => {
        const qty = 1 + Math.floor(Math.random() * 2);
        const unitPrice = price(p, "sellingPrice");
        const costPrice = price(p, "costPrice");
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;
        return {
          productId: p.id,
          productName: p.name,
          quantity: qty,
          unitPrice: dec(unitPrice),
          costPriceSnapshot: dec(costPrice),
          lineTotal: dec(lineTotal),
        };
      });

      const roll = Math.random();
      let paymentMethod: PaymentMethod = "CASH";
      if (roll > weights[0] + weights[1]) paymentMethod = "ON_ACCOUNT";
      else if (roll > weights[0]) paymentMethod = "CARD";

      const customer = paymentMethod === "ON_ACCOUNT" ? pick(customers) : Math.random() > 0.6 ? pick(customers) : null;

      const year = createdAt.getFullYear();
      let invoiceNumber: string;
      if (year >= 2026) {
        invoiceCounter2026++;
        invoiceNumber = `INV-${year}-${String(invoiceCounter2026).padStart(5, "0")}`;
      } else {
        invoiceCounter2025++;
        invoiceNumber = `INV-${year}-${String(invoiceCounter2025).padStart(5, "0")}`;
      }

      const sale = await prisma.sale.create({
        data: {
          invoiceNumber,
          customerId: customer?.id ?? null,
          customerName: customer?.name ?? (Math.random() > 0.5 ? "عميل نقدي" : null),
          paymentMethod,
          subtotal: dec(subtotal),
          total: dec(subtotal),
          createdById: pick(userIds),
          createdAt,
          items: { create: items },
        },
      });

      if (paymentMethod === "ON_ACCOUNT" && customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { totalDebt: { increment: subtotal } },
        });
      }

      salesCreated.push({
        id: sale.id,
        total: subtotal,
        paymentMethod,
        customerId: customer?.id ?? null,
        createdAt,
      });
    }
  }

  await prisma.invoiceSequence.upsert({
    where: { year: 2025 },
    create: { year: 2025, lastNumber: invoiceCounter2025 },
    update: { lastNumber: invoiceCounter2025 },
  });
  await prisma.invoiceSequence.upsert({
    where: { year: 2026 },
    create: { year: 2026, lastNumber: invoiceCounter2026 },
    update: { lastNumber: invoiceCounter2026 },
  });

  return salesCreated;
}

async function seedPayments(customers: { id: string }[]) {
  let count = 0;
  const debtCustomers = customers.slice(0, 8);
  for (const customer of debtCustomers) {
    const c = await prisma.customer.findUnique({ where: { id: customer.id } });
    if (!c || Number(c.totalDebt) <= 0) continue;

    const paymentsCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < paymentsCount; i++) {
      const debt = Number((await prisma.customer.findUnique({ where: { id: customer.id } }))!.totalDebt);
      if (debt <= 0) break;
      const amount = Math.min(debt, Math.round(debt * (0.2 + Math.random() * 0.5)));
      if (amount < 50) break;

      await prisma.payment.create({
        data: {
          customerId: customer.id,
          amount: dec(amount),
          date: dateOnly(daysAgo(Math.floor(Math.random() * 60))),
          notes: "دفعة جزئية",
        },
      });
      await prisma.customer.update({
        where: { id: customer.id },
        data: { totalDebt: { decrement: amount } },
      });
      count++;
    }
  }
  return count;
}

async function seedSaleReturns(
  sales: { id: string; createdAt: Date }[],
  products: ProductRow[],
  userIds: string[]
) {
  const eligible = sales.filter((_, i) => i % 15 === 0).slice(0, 15);
  for (const sale of eligible) {
    const p = pick(products);
    const refund = price(p, "sellingPrice");
    await prisma.saleReturn.create({
      data: {
        saleId: sale.id,
        date: dateOnly(new Date(sale.createdAt.getTime() + 86400000 * (2 + Math.floor(Math.random() * 5)))),
        totalRefund: dec(refund),
        notes: pick(["مرتجع - عيب مصنعي", "استبدال بجهاز آخر", "العميل غير راضٍ", "عطل بعد أسبوع"]),
        createdById: pick(userIds),
        items: {
          create: [{
            productId: p.id,
            quantity: 1,
            refundAmount: dec(refund),
            costSnapshot: dec(price(p, "costPrice")),
          }],
        },
      },
    });
  }
}

async function seedPurchaseReturns(
  purchases: { id: string; date: Date; items: { productId: string; quantity: number }[] }[],
  userIds: string[]
) {
  const eligible = purchases.filter((_, i) => i % 6 === 0).slice(0, 12);
  for (const purchase of eligible) {
    const item = pick(purchase.items);
    const returnQty = Math.max(1, Math.floor(item.quantity * 0.2));
    await prisma.purchaseReturn.create({
      data: {
        purchaseId: purchase.id,
        date: dateOnly(new Date(purchase.date.getTime() + 86400000 * 7)),
        notes: pick(["بضاعة تالفة", "خطأ في الطلب", "انتهاء صلاحية", "عيب في التغليف"]),
        createdById: pick(userIds),
        items: {
          create: [{ productId: item.productId, quantity: returnQty }],
        },
      },
    });
  }
}

const REPAIR_DEVICES = [
  "سامسونج جالكسي S24 ألترا",
  "سامسونج جالكسي A54",
  "آيفون 15 برو",
  "آيفون 14",
  "شاومي ريدمي نوت 13",
  "هواوي P60",
  "أوبو رينو 11",
  "ريلمي GT 5",
  "آيباد إير",
  "سامسونج جالكسي تاب",
];

const REPAIR_ISSUES = [
  "شاشة مكسورة",
  "بطارية ضعيفة",
  "لا يشحن",
  "مشكلة سماعة",
  "كاميرا لا تعمل",
  "تعليق النظام",
  "ماء داخل الجهاز",
  "زر الباور لا يعمل",
  "مشكلة شبكة",
  "تبديل شاشة LCD",
  "فك حساب iCloud",
  "تغيير فلاتة شحن",
];

const PROGRAMMING_SERVICES = [
  "فك قفل البرمجيات",
  "تجاوز FRP",
  "استرجاع البيانات",
  "تفليش وتحديث نظام",
  "فك شريحة الشبكة",
  "فك حساب iCloud",
  "إعادة برمجة IMEI",
  "تخطي حماية جوجل",
];

async function seedProgrammingOrders(customers: { name: string; phone: string }[], userIds: string[]) {
  const statuses: RepairStatus[] = ["NEW", "IN_PROGRESS", "READY", "DELIVERED"];
  let orderCounter = 0;
  let count = 0;

  for (let day = 180; day >= 0; day--) {
    const ordersToday = day % 7 === 5 ? 0 : Math.random() > 0.65 ? 1 + Math.floor(Math.random() * 2) : 0;
    for (let r = 0; r < ordersToday; r++) {
      orderCounter++;
      const createdAt = daysAgo(day);
      const customer = pick(customers);
      const cost = 60 + Math.floor(Math.random() * 340);
      const daysSince = 180 - day;
      let status: RepairStatus;
      if (daysSince > 14) status = "DELIVERED";
      else if (daysSince > 7) status = pick(["READY", "DELIVERED"]);
      else if (daysSince > 3) status = pick(["IN_PROGRESS", "READY"]);
      else status = pick(statuses);

      await prisma.programmingOrder.create({
        data: {
          orderNumber: `PRG-${createdAt.getFullYear()}-${String(orderCounter).padStart(4, "0")}`,
          customerName: customer.name,
          phone: customer.phone,
          deviceType: pick(REPAIR_DEVICES),
          serviceType: pick(PROGRAMMING_SERVICES),
          cost: dec(cost),
          status,
          notes: Math.random() > 0.75 ? "العميل طلب نسخة احتياطية قبل البدء" : null,
          createdById: pick(userIds),
          createdAt,
          deliveredAt: status === "DELIVERED" ? new Date(createdAt.getTime() + 86400000 * (1 + Math.floor(Math.random() * 4))) : null,
        },
      });
      count++;
    }
  }
  return count;
}

async function seedRepairOrders(customers: { name: string; phone: string }[], userIds: string[]) {
  const statuses: RepairStatus[] = ["NEW", "IN_PROGRESS", "READY", "DELIVERED"];
  let orderCounter = 0;
  let count = 0;

  for (let day = 180; day >= 0; day--) {
    const repairsToday = day % 7 === 5 ? 0 : Math.random() > 0.55 ? 1 + Math.floor(Math.random() * 3) : 0;
    for (let r = 0; r < repairsToday; r++) {
      orderCounter++;
      const createdAt = daysAgo(day);
      const customer = pick(customers);
      const cost = 80 + Math.floor(Math.random() * 420);
      const daysSince = 180 - day;
      let status: RepairStatus;
      if (daysSince > 14) status = "DELIVERED";
      else if (daysSince > 7) status = pick(["READY", "DELIVERED"]);
      else if (daysSince > 3) status = pick(["IN_PROGRESS", "READY"]);
      else status = pick(statuses);

      await prisma.repairOrder.create({
        data: {
          orderNumber: `REP-${createdAt.getFullYear()}-${String(orderCounter).padStart(4, "0")}`,
          customerName: customer.name,
          phone: customer.phone,
          deviceType: pick(REPAIR_DEVICES),
          issue: pick(REPAIR_ISSUES),
          cost: dec(cost),
          status,
          notes: Math.random() > 0.7 ? "العميل طلب الاتصال قبل التسليم" : null,
          createdById: pick(userIds),
          createdAt,
          deliveredAt: status === "DELIVERED" ? new Date(createdAt.getTime() + 86400000 * (2 + Math.floor(Math.random() * 5))) : null,
        },
      });
      count++;
    }
  }
  return count;
}

async function seedStockMovements(userIds: string[]) {
  const products = await prisma.product.findMany({
    select: { id: true, warehouseId: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const balances = new Map<string, number>();
  for (const p of products) balances.set(p.id, 0);

  type MovementEvent = { at: Date; run: () => Promise<void> };
  const events: MovementEvent[] = [];

  const purchases = await prisma.purchase.findMany({
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
  for (const purchase of purchases) {
    for (const item of purchase.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      events.push({
        at: purchase.createdAt,
        run: async () => {
          const bal = (balances.get(item.productId) ?? 0) + item.quantity;
          balances.set(item.productId, bal);
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: product.warehouseId,
              type: StockMovementType.PURCHASE,
              quantity: item.quantity,
              balanceAfter: bal,
              referenceId: purchase.id,
              referenceType: "Purchase",
              createdById: pick(userIds),
              createdAt: purchase.createdAt,
            },
          });
        },
      });
    }
  }

  const sales = await prisma.sale.findMany({
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
  for (const sale of sales) {
    for (const item of sale.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      events.push({
        at: sale.createdAt,
        run: async () => {
          const bal = (balances.get(item.productId) ?? 0) - item.quantity;
          balances.set(item.productId, bal);
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: product.warehouseId,
              type: StockMovementType.SALE,
              quantity: -item.quantity,
              balanceAfter: bal,
              referenceId: sale.id,
              referenceType: "Sale",
              createdById: pick(userIds),
              createdAt: sale.createdAt,
            },
          });
        },
      });
    }
  }

  const saleReturns = await prisma.saleReturn.findMany({
    include: { items: true },
    orderBy: { date: "asc" },
  });
  for (const sr of saleReturns) {
    for (const item of sr.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      events.push({
        at: new Date(sr.date),
        run: async () => {
          const bal = (balances.get(item.productId) ?? 0) + item.quantity;
          balances.set(item.productId, bal);
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: product.warehouseId,
              type: StockMovementType.SALE_RETURN,
              quantity: item.quantity,
              balanceAfter: bal,
              referenceId: sr.id,
              referenceType: "SaleReturn",
              createdById: pick(userIds),
              createdAt: new Date(sr.date),
            },
          });
        },
      });
    }
  }

  const purchaseReturns = await prisma.purchaseReturn.findMany({
    include: { items: true },
    orderBy: { date: "asc" },
  });
  for (const pr of purchaseReturns) {
    for (const item of pr.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      events.push({
        at: new Date(pr.date),
        run: async () => {
          const bal = (balances.get(item.productId) ?? 0) - item.quantity;
          balances.set(item.productId, bal);
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: product.warehouseId,
              type: StockMovementType.PURCHASE_RETURN,
              quantity: -item.quantity,
              balanceAfter: bal,
              referenceId: pr.id,
              referenceType: "PurchaseReturn",
              createdById: pick(userIds),
              createdAt: new Date(pr.date),
            },
          });
        },
      });
    }
  }

  const transfers = await prisma.stockTransfer.findMany({ orderBy: { createdAt: "asc" } });
  for (const tr of transfers) {
    const product = productMap.get(tr.productId);
    if (!product) continue;
    events.push({
      at: tr.createdAt,
      run: async () => {
        const outBal = (balances.get(tr.productId) ?? 0) - tr.quantity;
        balances.set(tr.productId, outBal);
        await prisma.stockMovement.create({
          data: {
            productId: tr.productId,
            warehouseId: tr.fromWarehouseId,
            type: StockMovementType.TRANSFER_OUT,
            quantity: -tr.quantity,
            balanceAfter: outBal,
            referenceId: tr.id,
            referenceType: "StockTransfer",
            notes: tr.notes,
            createdById: tr.createdById,
            createdAt: tr.createdAt,
          },
        });
        const inBal = (balances.get(tr.productId) ?? 0) + tr.quantity;
        balances.set(tr.productId, inBal);
        await prisma.stockMovement.create({
          data: {
            productId: tr.productId,
            warehouseId: tr.toWarehouseId,
            type: StockMovementType.TRANSFER_IN,
            quantity: tr.quantity,
            balanceAfter: inBal,
            referenceId: tr.id,
            referenceType: "StockTransfer",
            notes: tr.notes,
            createdById: tr.createdById,
            createdAt: tr.createdAt,
          },
        });
      },
    });
  }

  events.sort((a, b) => a.at.getTime() - b.at.getTime());
  for (const event of events) await event.run();
  return events.length;
}

async function seedStockTransfers(
  mainWh: { id: string },
  accWh: { id: string },
  products: ProductRow[],
  userIds: string[]
) {
  const accProducts = products.filter((p) => p.sku.startsWith("ACC-") || p.sku.startsWith("SIM-"));
  const mainProducts = products.filter((p) => p.sku.startsWith("SAM-") || p.sku.startsWith("XIA-"));

  const transfers = [
    { from: accWh, to: mainWh, product: pick(accProducts), qty: 10, days: 30, notes: "نقل للعرض في المستودع الرئيسي" },
    { from: accWh, to: mainWh, product: pick(accProducts), qty: 25, days: 45, notes: "تجهيز مخزون نقطة البيع" },
    { from: mainWh, to: accWh, product: pick(accProducts), qty: 15, days: 60, notes: "إعادة توزيع إكسسوارات" },
    { from: accWh, to: mainWh, product: pick(accProducts), qty: 8, days: 75, notes: "طلب عاجل من الفرع" },
    { from: mainWh, to: accWh, product: pick(mainProducts), qty: 3, days: 90, notes: "نقل عينات للمعرض" },
    { from: accWh, to: mainWh, product: pick(accProducts), qty: 20, days: 120, notes: "تعبئة مخزون نهاية الشهر" },
    { from: accWh, to: mainWh, product: pick(accProducts), qty: 12, days: 150, notes: "تحضير موسم العروض" },
  ];

  for (const t of transfers) {
    if (!t.product) continue;
    await prisma.stockTransfer.create({
      data: {
        fromWarehouseId: t.from.id,
        toWarehouseId: t.to.id,
        productId: t.product.id,
        quantity: t.qty,
        notes: t.notes,
        createdById: pick(userIds),
        createdAt: daysAgo(t.days),
      },
    });
  }
}

async function main() {
  console.log("Seeding rich demo data (180 days history)...");

  await wipeTransactionalData();
  const { mainWh, accWh, categoryMap } = await ensureShopDefaults();
  const { admin, employee } = await ensureUsers();
  const userIds = [admin.id, employee.id];

  const products = await seedProducts(mainWh, accWh, categoryMap);
  console.log(`  ✓ ${products.length} products`);

  const customers = await seedCustomers();
  console.log(`  ✓ ${customers.length} customers`);

  const purchases = await seedPurchases(products, userIds);
  const purchasesWithItems = await prisma.purchase.findMany({
    include: { items: { select: { productId: true, quantity: true } } },
    orderBy: { date: "asc" },
  });
  console.log(`  ✓ ${purchases.length} purchases`);

  const expenseCount = await seedExpenses();
  console.log(`  ✓ ${expenseCount} expenses`);

  const sales = await seedSales(products, customers, userIds);
  console.log(`  ✓ ${sales.length} sales`);

  const paymentCount = await seedPayments(customers);
  console.log(`  ✓ ${paymentCount} customer payments`);

  await seedSaleReturns(sales, products, userIds);
  console.log("  ✓ sale returns");

  await seedPurchaseReturns(purchasesWithItems, userIds);
  console.log("  ✓ purchase returns");

  const repairCount = await seedRepairOrders(CUSTOMERS, userIds);
  console.log(`  ✓ ${repairCount} repair orders`);

  const programmingCount = await seedProgrammingOrders(CUSTOMERS, userIds);
  console.log(`  ✓ ${programmingCount} programming orders`);

  await seedStockTransfers(mainWh, accWh, products, userIds);
  console.log("  ✓ stock transfers");

  const movementCount = await seedStockMovements(userIds);
  console.log(`  ✓ ${movementCount} stock movements`);

  const debtTotal = await prisma.customer.aggregate({ _sum: { totalDebt: true } });
  const repairStats = await prisma.repairOrder.groupBy({ by: ["status"], _count: true });
  console.log(`\nDemo data seeded successfully.`);
  console.log(`  Sales: ${sales.length} | Products: ${products.length} | Customers: ${customers.length}`);
  console.log(`  Repairs: ${repairCount} | Programming: ${programmingCount} | Movements: ${movementCount}`);
  console.log(`  Repair status: ${repairStats.map((s) => `${s.status}=${s._count}`).join(", ")}`);
  console.log(`  Outstanding debt: ${Number(debtTotal._sum.totalDebt ?? 0).toFixed(2)}`);
  console.log(`  Demo employee login: employee@demo.shop / employee123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
