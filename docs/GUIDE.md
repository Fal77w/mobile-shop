# دليل moblies-shop — التوثيق الكامل

نظام **POS وإدارة مخزون** لمتجر موبايلات صغير. مبني على نفس تقنيات [StoreLedger](../StoreLedger) (Next.js + Prisma + Docker) لكن مخصص للبيع المباشر والمخزون.

---

## 1. ما تم بناؤه

### التقنيات

| الطبقة | التقنية |
|--------|---------|
| Frontend + Backend | Next.js 16 (App Router) — monolith |
| قاعدة البيانات | PostgreSQL 16 + Prisma 6 |
| المصادقة | Auth.js (Credentials + JWT + bcrypt) |
| الواجهة | Tailwind 4 + Radix UI (Shadcn-style) |
| الترجمة | next-intl — عربي (RTL) / إنجليزي |
| الفواتير | @react-pdf/renderer — PDF A4 |
| الاختبارات | Vitest |
| النشر | Docker Compose (standalone) |

### النموذج المعماري

- **متجر واحد** لكل deployment (ليس multi-tenant مثل StoreLedger)
- **Admin + Employee** — الصلاحيات عبر `User.role`
- **Clean Architecture**: منطق الأعمال في `lib/application/services/`
- **Server Actions** للعمليات (إضافة، تعديل، بيع، شراء...)
- **Prisma `$transaction`** لكل تغيير في المخزون

### قاعدة البيانات (Prisma)

| Model | الوظيفة |
|-------|---------|
| `User` | مستخدمون (Admin / Employee) |
| `ShopSettings` | اسم المتجر، الهاتف، العنوان، بادئة الفاتورة |
| `Warehouse` | مستودعات (رئيسي، إكسسوارات...) |
| `Category` | فئات داخل كل مستودع |
| `Product` | منتجات (SKU, barcode, أسعار, كمية) |
| `Sale` + `SaleItem` | مبيعات POS + بنود الفاتورة |
| `Purchase` + `PurchaseItem` | مشتريات من الموردين |
| `SaleReturn` + `SaleReturnItem` | مرتجع مبيعات |
| `PurchaseReturn` + `PurchaseReturnItem` | مرتجع مشتريات |
| `Customer` + `Payment` | عملاء + ديون + دفعات |
| `Expense` | مصروفات (إيجار، رواتب...) |
| `StockTransfer` | نقل مخزون بين مستودعات |
| `InvoiceSequence` | ترقيم تلقائي للفواتير |

### الصفحات المنفذة

| المسار | الوصف | الصلاحية |
|--------|-------|----------|
| `/login` | تسجيل الدخول | عام |
| `/dashboard` | لوحة تحكم (مبيعات اليوم، ربح، ديون، مخزون منخفض) | الكل |
| `/pos` | نقطة البيع | الكل |
| `/pos/sales/[id]` | تفاصيل البيع + طباعة فاتورة | الكل |
| `/inventory/products` | إدارة المنتجات | الكل |
| `/inventory/warehouses` | إدارة المستودعات | الكل |
| `/inventory/categories` | إدارة الفئات | الكل |
| `/inventory/transfers` | نقل المخزون | الكل |
| `/purchases` | المشتريات | الكل |
| `/returns` | مرتجعات مبيعات / مشتريات | الكل |
| `/customers` | العملاء | الكل |
| `/customers/[id]` | تفاصيل عميل + دفعات | الكل |
| `/expenses` | المصروفات | الكل |
| `/reports` | التقارير | الكل |
| `/users` | إدارة المستخدمين | Admin فقط |
| `/settings` | إعدادات المتجر | Admin فقط |

### API Routes

| Route | الوظيفة |
|-------|---------|
| `/api/auth/[...nextauth]` | مصادقة Auth.js |
| `/api/search?q=` | بحث منتجات (POS) |
| `/api/invoices/[id]/pdf` | فاتورة PDF A4 |

### هيكل المجلدات

```
moblies-shop/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/          # كل صفحات النظام
│   └── api/
├── components/
│   ├── ui/                   # مكونات Shadcn
│   ├── layout/               # Sidebar, Header, Nav
│   └── forms/
├── lib/
│   ├── domain/               # أخطاء، حساب الربح
│   ├── application/services/ # منطق الأعمال
│   ├── validations/          # Zod schemas
│   ├── auth.ts, session.ts, prisma.ts
├── prisma/
│   ├── schema.prisma
│   ├── bootstrap.ts          # إنشاء Admin + بيانات أولية
│   └── migrations/
├── messages/ar.json, en.json
├── public/                   # مطلوب لـ Docker build
├── scripts/docker-init.sh
├── Dockerfile
└── docker-compose.yml
```

---

## 2. التثبيت والتشغيل

### Docker (موصى به للإنتاج)

```bash
cd moblies-shop
cp .env.example .env
```

عدّل `.env`:

```env
APP_PORT=3022
AUTH_URL=http://localhost:3022          # يجب أن يطابق عنوان الوصول
AUTH_SECRET=...                           # openssl rand -base64 32
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=كلمة-مرور-قوية
ADMIN_NAME=مدير المتجر
ADMIN_LOCALE=ar
```

```bash
docker compose up -d --build
```

افتح: **http://localhost:3022**

### تشغيل محلي (بدون Docker)

```bash
cp .env.example .env
# أضف DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mobiles_shop

npm install
npx prisma migrate deploy
npm run db:bootstrap
npm run dev
```

افتح: **http://localhost:3000**

### بيانات تجريبية (اختياري)

```bash
npm run docker:seed    # داخل Docker
# أو
npm run db:seed        # محلياً
```

> **ملاحظة:** الـ seed يحذف المنتجات والمبيعات والعملاء التجريبيين فقط — **لا يحذف** المستخدمين Admin. يُنشئ:
> - **~30 منتج** (سامسونج، آيفون، شاومي، إكسسوارات، برمجة)
> - **~20 عميل** + ديون ودفعات
> - **~300+ عملية بيع** موزعة على 90 يوم
> - **18 مشترى** + **24 مصروف** + مرتجعات
> - موظف تجريبي: `employee@demo.shop` / `employee123`

### أوامر مفيدة

| الأمر | الوظيفة |
|-------|---------|
| `npm run dev` | تشغيل التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run test` | تشغيل الاختبارات |
| `npm run docker:up` | تشغيل Docker |
| `npm run docker:down` | إيقاف Docker |
| `npm run docker:logs` | عرض logs |
| `npm run db:studio` | واجهة Prisma للبيانات |
| `docker compose down -v` | حذف كل البيانات والبدء من جديد |

---

## 3. دليل الاستخدام

### أول تشغيل

1. شغّل النظام (Docker أو محلي)
2. عند **قاعدة بيانات فارغة** يُنشأ تلقائياً:
   - مستخدم Admin من `.env`
   - مستودعان: Main Warehouse, Accessories Warehouse
   - فئات: Samsung, Apple, Xiaomi, Accessories, Programming
   - إعدادات المتجر الافتراضية
3. سجّل الدخول بالبريد وكلمة المرور من `.env`

### إعداد المتجر (Admin)

1. اذهب إلى **الإعدادات** (`/settings`)
2. عدّل: اسم المتجر، الهاتف، العنوان، بادئة الفاتورة (مثل `INV`)
3. البادئة تُستخدم في أرقام الفواتير: `INV-2026-00001`

### إدارة المستخدمين (Admin)

1. **المستخدمون** (`/users`)
2. أضف موظفين (Employee) أو مديرين (Admin)
3. Employee: كل الصلاحيات **ما عدا** المستخدمون والإعدادات

### إعداد المخزون

#### المستودعات
- **المستودعات** → أضف (مثال: Main Warehouse, Accessories Warehouse)

#### الفئات
- **الفئات** → أضف فئة واربطها بمستودع (Samsung, Apple, Xiaomi...)

#### المنتجات
- **المنتجات** → أضف منتج:
  - الاسم، SKU، Barcode (اختياري)
  - المستودع والفئة
  - **سعر التكلفة** و**سعر البيع**
  - الكمية وتنبيه انخفاض المخزون

#### نقل المخزون
- **نقل المخزون** → انقل كمية منتج من مستودع لآخر
- إذا المنتج غير موجود في المستودع الهدف → يُنشأ تلقائياً بنفس SKU

### المشتريات (زيادة المخزون)

1. **المشتريات** → نموذج شراء جديد
2. أدخل: اسم المورد، رقم فاتورة المورد، التاريخ
3. أضف المنتجات + الكمية + **سعر التكلفة**
4. عند الحفظ → **تزيد الكمية** تلقائياً

### نقطة البيع (POS)

1. **نقطة البيع** (`/pos`)
2. ابحث عن منتج (اسم / SKU / barcode)
3. اضغط على المنتج → يُضاف للسلة
4. عدّل الكمية أو احذف
5. اختر **طريقة الدفع**:
   - **نقداً** (CASH)
   - **بطاقة** (CARD)
   - **آجل / دين** (ON_ACCOUNT) — **يجب** اختيار عميل
6. اسم العميل (اختياري) يظهر على الفاتورة
7. **إتمام البيع** → يُخصم المخزون + تُنشأ فاتورة
8. **طباعة** → PDF A4 (بدون سعر التكلفة)

### العملاء والديون

1. **العملاء** → أضف عميل (اسم، هاتف)
2. عند بيع **آجل** → يزيد `totalDebt` تلقائياً
3. من صفحة العميل → **تسجيل دفعة** لتقليل الدين
4. التقرير يعرض: إجمالي المشتريات، المدفوع، المتبقي

### المرتجعات

**مرتجع مبيعات:**
- يزيد المخزون
- يقلل الإيراد (في التقارير)
- إذا البيع كان آجل → يقلل دين العميل

**مرتجع مشتريات:**
- ينقص المخزون

### المصروفات

- **المصروفات** → أضف (إيجار، كهرباء، رواتب...)
- تُستخدم في حساب **صافي الربح**

### التقارير

| التبويب | المحتوى |
|---------|---------|
| مبيعات يومية | إجمالي اليوم + عدد العمليات + إجمالي الربح |
| مبيعات شهرية | إجمالي الشهر + تفصيل يومي |
| الأرباح | إجمالي الربح، صافي الربح، حسب المستودع، حسب الفئة |
| الديون | العملاء الذين عليهم ديون |
| المصروفات | قائمة المصروفات |
| مخزون منخفض | منتجات ≤ حد التنبيه |

**معادلات الربح:**
```
إجمالي الربح = Σ(سعر البيع − سعر التكلفة) × الكمية − مرتجعات
صافي الربح   = إجمالي الربح − المصروفات
```

---

## 4. قواعد المخزون (تلقائية)

| العملية | تأثير المخزون |
|---------|---------------|
| بيع (POS) | − كمية |
| شراء | + كمية |
| مرتجع مبيعات | + كمية |
| مرتجع مشتريات | − كمية |
| نقل مخزون | − من المصدر، + في الهدف |
| بيع آجل | + دين العميل |
| دفعة عميل | − دين العميل |

---

## 5. الصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| **Admin** | كل الصفحات + `/users` + `/settings` |
| **Employee** | POS، مخزون، مشتريات، مرتجعات، عملاء، مصروفات، تقارير |

---

## 6. استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Docker build فشل: `public not found` | تأكد وجود مجلد `public/` |
| لا أستطيع تسجيل الدخول | تحقق من `ADMIN_EMAIL/PASSWORD` وشغّل `db:bootstrap` |
| Auth error في الإنتاج | `AUTH_SECRET` و `AUTH_URL` يجب أن يطابقا عنوان الموقع |
| مخزون غير كافٍ عند البيع | راجع الكمية في **المنتجات** أو أضف **شراء** |
| Employee يرى Users | Middleware يمنعه — طبيعي |

---

## 7. الفرق عن StoreLedger

| StoreLedger | moblies-shop |
|-------------|--------------|
| Multi-tenant (كل user = متجر) | متجر واحد مشترك |
| Orders + Accounting ledger | POS + Inventory |
| Double-entry accounting | ربح بسيط (gross/net) |
| منفذ 3021 | منفذ 3022 |

---

## 8. المراجع

- [دليل التشغيل السريع](RUN.md)
- [README](../README.md)
- [Prisma Schema](../prisma/schema.prisma)
- [قواعد المشروع](../.cursor/rules/project-rules.mdc)
