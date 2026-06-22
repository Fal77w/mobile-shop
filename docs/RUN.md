# دليل التشغيل — moblies-shop

> للتوثيق الكامل وشرح الاستخدام راجع [GUIDE.md](GUIDE.md)

## المتطلبات

- Node.js 20+
- PostgreSQL 16 (أو Docker)

## التشغيل المحلي

1. انسخ `.env.example` إلى `.env`
2. عدّل:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mobiles_shop`
   - `AUTH_SECRET` — مثال: `openssl rand -base64 32`
   - `ADMIN_EMAIL` و `ADMIN_PASSWORD`
3. نفّذ:

```bash
npm install
npx prisma migrate deploy
npm run db:bootstrap
npm run dev
```

4. افتح http://localhost:3000 وسجّل الدخول

## Docker (إنتاج)

```bash
cp .env.example .env
```

عدّل `.env`:

```env
APP_PORT=3022
AUTH_URL=http://localhost:3022
AUTH_SECRET=your-secret-here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-password
```

```bash
docker compose up -d --build
```

افتح http://localhost:3022

## بيانات تجريبية

```bash
docker compose --profile demo run --rm seed
# أو محلياً:
npm run db:seed
```

## الصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| Admin | كل الصفحات + المستخدمون + الإعدادات |
| Employee | كل شيء ما عدا المستخدمون والإعدادات |

## أوامر Docker

```bash
npm run docker:up       # تشغيل
npm run docker:down     # إيقاف
npm run docker:logs     # عرض logs
docker compose down -v  # حذف البيانات والبدء من جديد
```

## أول استخدام

1. سجّل دخول Admin من `.env`
2. **الإعدادات** → عدّل اسم المتجر وبادئة الفاتورة
3. **المنتجات** → أضف منتجات (أو شغّل seed)
4. **نقطة البيع** → ابدأ البيع

## الميزات

- نقطة بيع (POS) — نقد / بطاقة / آجل
- مستودعات + فئات + منتجات + نقل مخزون
- مشتريات ومرتجعات
- عملاء وديون ودفعات
- مصروفات
- تقارير (مبيعات / أرباح / ديون / مخزون منخفض)
- فاتورة PDF A4 (بدون سعر التكلفة)
