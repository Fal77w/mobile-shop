# دليل التشغيل — moblies-shop

> للتوثيق الكامل وشرح الاستخدام راجع [GUIDE.md](GUIDE.md)  
> لسجل التطوير الأخير راجع [CHANGELOG.md](CHANGELOG.md)

## المتطلبات

- Node.js 20+
- PostgreSQL 16 (أو Docker)

## Docker Compose (موصى به)

### المتطلبات

- Docker 24+
- Docker Compose v2 (`docker compose`)

### 1. إعداد البيئة

```bash
cd moblies-shop
cp .env.example .env
```

عدّل `.env` — **الحقول الإلزامية:**

```env
APP_PORT=3022
AUTH_URL=http://localhost:3022
AUTH_SECRET=your-secret-here          # openssl rand -base64 32
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=مدير المتجر
ADMIN_LOCALE=ar
```

> **مهم:** `AUTH_URL` يجب أن يطابق عنوان المتصفح بالضبط (نفس المنفذ والبروتوكول).

### 2. تشغيل المشروع

```bash
docker compose up -d --build
```

أو عبر npm:

```bash
npm run docker:up
```

**ما يحدث تلقائياً:**

| الخدمة | الوظيفة |
|--------|---------|
| `postgres` | قاعدة بيانات PostgreSQL 16 |
| `migrate` | تطبيق migrations + إنشاء Admin عند قاعدة فارغة |
| `app` | تطبيق Next.js على المنفذ `APP_PORT` |

افتح: **http://localhost:3022**  
سجّل الدخول بـ `ADMIN_EMAIL` / `ADMIN_PASSWORD` من `.env`

### 3. بيانات تجريبية (اختياري)

بعد تشغيل المشروع، أضف بيانات عربية غنية (~800+ مبيعة، 180 يوم):

```bash
docker compose --profile demo run --rm seed
```

أو عبر npm:

```bash
npm run docker:seed
```

**ماذا يُنشئ الـ seed:**
- ~47 منتج (أسماء عربية)
- ~39 عميل
- ~800+ مبيعة على 180 يوم
- مشتريات، مصروفات، صيانة، برمجة، حركات مخزون
- موظف تجريبي: `employee@demo.shop` / `employee123`

> الـ seed يحذف **البيانات التشغيلية فقط** (منتجات، مبيعات، عملاء...) ولا يحذف المستخدمين.

**إعادة تعبئة البيانات التجريبية:**

```bash
docker compose --profile demo run --rm seed
```

### 4. أوامر Docker مفيدة

```bash
# عرض سجلات التطبيق
docker compose logs -f app
npm run docker:logs

# إيقاف الخدمات (البيانات تبقى)
docker compose down
npm run docker:down

# إيقاف + حذف قاعدة البيانات والبدء من جديد
docker compose down -v

# إعادة بناء التطبيق بعد تعديل الكود
docker compose up -d --build app

# حالة الخدمات
docker compose ps
```

### 5. استكشاف أخطاء Docker

| المشكلة | الحل |
|---------|------|
| لا أستطيع تسجيل الدخول | تحقق من `ADMIN_EMAIL/PASSWORD` — أعد التشغيل بـ `docker compose down -v` ثم `up` |
| خطأ Auth / redirect loop | `AUTH_SECRET` و `AUTH_URL` يجب أن يطابقا عنوان الوصول |
| `migrate` فشل | `docker compose logs migrate` — تأكد أن postgres صحي |
| المنفذ مشغول | غيّر `APP_PORT` في `.env` (مثلاً 3023) وحدّث `AUTH_URL` |
| البيانات التجريبية لا تظهر | شغّل `docker compose --profile demo run --rm seed` بعد `up` |

---

## التشغيل المحلي (تطوير)

1. انسخ `.env.example` إلى `.env`
2. عدّل:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mobiles_shop`
   - `AUTH_URL=http://localhost:3002`
   - `AUTH_SECRET` — مثال: `openssl rand -base64 32`
   - `ADMIN_EMAIL` و `ADMIN_PASSWORD`
3. نفّذ:

```bash
npm install
npx prisma migrate deploy
npm run db:bootstrap
npm run dev:clean -- --port 3002
```

4. افتح http://localhost:3002 وسجّل الدخول

### أوامر تطوير مفيدة

```bash
npm run dev:kill                              # إيقاف منافذ 3001/3002
npm run dev:clean -- --port 3002              # تشغيل نظيف (webpack)
npm run db:seed                               # بيانات تجريبية (~900 مبيعة / 180 يوم)
```

### بيانات تجريبية (محلي)

```bash
npm run db:seed
```

نفس البيانات العربية — يتطلب `DATABASE_URL` في `.env` وقاعدة بيانات شغّالة.

---

## Docker (إنتاج) — ملخص سريع

```bash
cp .env.example .env   # عدّل AUTH_SECRET, ADMIN_*, AUTH_URL
docker compose up -d --build
docker compose --profile demo run --rm seed   # بيانات تجريبية
```

افتح http://localhost:3022

> للتفاصيل الكاملة راجع قسم **Docker Compose** أعلاه.

## الصلاحيات

| الدور | Prisma | الصلاحيات |
|-------|--------|-----------|
| **مدير** | `ADMIN` | كل شيء + مستخدمون + إعدادات + نسخ احتياطي |
| **محاسب** | `ACCOUNTANT` | + مشتريات + مصروفات + تقارير مالية |
| **مبيعات** | `SALES` / `EMPLOYEE` | POS، مبيعات، مخزون، عملاء، صيانة، برمجة |

## أوامر npm للـ Docker

| الأمر | الوظيفة |
|-------|---------|
| `npm run docker:up` | `docker compose up -d --build` |
| `npm run docker:down` | إيقاف الخدمات |
| `npm run docker:logs` | عرض logs التطبيق |
| `npm run docker:seed` | بيانات تجريبية عبر Docker |

## أول استخدام

1. سجّل دخول Admin من `.env`
2. **الإعدادات** → اسم المتجر، شعار، بادئة الفاتورة
3. **المنتجات** → أضف منتجات (أو شغّل `db:seed`)
4. **نقطة البيع** → شبكة منتجات + إتمام البيع
5. **المبيعات** → مراجعة العمليات والفواتير

## الميزات الرئيسية

- نقطة بيع (POS) — شبكة منتجات + فئات + دفع سريع (نقد / بطاقة / آجل)
- صفحة المبيعات — فلتر تاريخ + تفاصيل البنود
- صيانة وبرمجة — أوامر مع تتبع الحالة
- مستودعات + فئات + منتجات + SKU تلقائي + نقل مخزون
- مشتريات ومرتجعات (حسب الصلاحية)
- عملاء وديون ودفعات
- مصروفات (Admin + Accountant)
- تقارير (مبيعات / أرباح / ديون / مخزون منخفض)
- فاتورة PDF A4 عربية (Noto Sans Arabic)
- إعدادات: شعار، تذييل فاتورة، باركود نصي
