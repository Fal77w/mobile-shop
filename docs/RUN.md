# دليل التشغيل — moblies-shop

> للتوثيق الكامل وشرح الاستخدام راجع [GUIDE.md](GUIDE.md)  
> لسجل التطوير الأخير راجع [CHANGELOG.md](CHANGELOG.md)

## المتطلبات

- Node.js 20+
- PostgreSQL 16 (أو Docker)

## التشغيل المحلي

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

**حسابات تجريبية:**
- Admin: من `.env`
- موظف مبيعات: `employee@demo.shop` / `employee123`

## الصلاحيات

| الدور | Prisma | الصلاحيات |
|-------|--------|-----------|
| **مدير** | `ADMIN` | كل شيء + مستخدمون + إعدادات + نسخ احتياطي |
| **محاسب** | `ACCOUNTANT` | + مشتريات + مصروفات + تقارير مالية |
| **مبيعات** | `SALES` / `EMPLOYEE` | POS، مبيعات، مخزون، عملاء، صيانة، برمجة |

## أوامر Docker

```bash
npm run docker:up       # تشغيل
npm run docker:down     # إيقاف
npm run docker:logs     # عرض logs
docker compose down -v  # حذف البيانات والبدء من جديد
```

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
