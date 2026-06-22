# moblies-shop — System Audit & Gap Analysis

**Date:** 2026-06-22 (updated after major feature batch)  
**Stack:** Next.js 16, PostgreSQL 16, Prisma 6, Auth.js, next-intl, @react-pdf/renderer

---

## A. Implemented Features ✅

### Auth & Users
- Login (Credentials + JWT + bcrypt) — `lib/auth.ts`
- Roles: `ADMIN`, `ACCOUNTANT`, `SALES`, `EMPLOYEE` (legacy → SALES via `normalizeRole()`)
- Middleware route guards — `middleware.ts`
- Session helpers — `requireUser()`, `requireAdmin()`, `requireAccountantOrAdmin()`
- **RBAC permissions** — `lib/permissions.ts`
- User CRUD (Admin) — `app/(dashboard)/users/`

### Sales / POS
- **Redesigned POS** — product grid + category tabs + search — `/pos`
- Quick payment buttons (Cash / Card / On Account)
- Categories from in-stock product `Category.name`
- Cart, qty edit, customer select for ON_ACCOUNT
- Auto stock deduction + `StockMovement` type `SALE` — `sale-service.ts`
- **Sales list page** — `/sales` with date filter, line items, employee, payment method
- A4 printable invoice PDF — `/api/invoices/[id]/pdf`
- **Arabic PDF** — Noto Sans Arabic via `lib/pdf/register-fonts.ts`
- Invoice: shop name, logo, phone, address, footer, optional barcode text
- Sale detail + print — `/pos/sales/[id]`
- Invoice auto-numbering — `InvoiceSequence` + `ShopSettings.invoicePrefix`
- `costPriceSnapshot` on `SaleItem` for profit history

### Inventory
- Products (SKU auto-generate if empty, barcode, cost/selling price, qty, low stock)
- Subcategories — `Category.parentId`
- Multiple warehouses — `/inventory/warehouses`
- Stock transfers — `/inventory/transfers`
- Stock movement history — `/inventory/movements`
- Low stock query — `getLowStockProducts()`
- Programming products in "Programming" category (POS sale)

### Purchases
- Supplier purchases — `/purchases` (Admin + Accountant)
- Auto stock increase — `purchase-service.ts`

### Returns
- Sales returns (restore stock, link to sale) — `/returns`
- Purchase returns (reduce stock, link to purchase)
- Debt adjustment on ON_ACCOUNT sale returns

### Expenses
- CRUD — `/expenses` (Admin + Accountant)
- Used in net profit calculation

### Debts / Customers
- Customer CRUD — `/customers`
- ON_ACCOUNT sales increase `totalDebt`
- Payment recording — `/customers/[id]`

### Reports
- Daily / monthly / custom date range sales
- Gross / net profit, by warehouse, by category (Admin + Accountant)
- Profit per item, inventory valuation (Admin + Accountant)
- Debt, expense, low stock reports
- Repair income + programming income reports
- Dashboard stats (profit hidden from Sales role)

### Repair Department
- `RepairOrder` model — status workflow (NEW → IN_PROGRESS → READY → DELIVERED)
- CRUD UI — `/repairs`

### Programming Department
- **`ProgrammingOrder` model** — same workflow as repairs
- CRUD UI — `/programming`
- Separate from selling Programming-category products via POS

### Settings & Branding
- Shop name, phone, address, invoice prefix
- **Logo upload** → `public/uploads/`
- **Invoice footer text**, **barcode toggle**
- Shop name in Sidebar/Header from `ShopSettings` (not static i18n)

### Backup System
- Manual export/restore — `/api/backup` (Admin)
- Settings UI backup panel
- Cron helper — `scripts/backup-cron.sh`

### UI/UX
- Tajawal (Arabic) + Inter (Latin) fonts
- SaaS indigo design system — `globals.css`
- Sidebar groups, mobile bottom nav (dashboard, POS, sales, customers)
- Sticky sidebar — logout/theme always visible
- `DataTableShell`, `EmptyState`, `FormSection`, `Button loading`
- `formatMoney()` — no trailing `.00`, Latin digits

### i18n
- Arabic (RTL) + English — full keys including POS categories, programming, sales
- Language switcher, user locale in DB

### Deploy & Data
- Docker Compose (postgres → migrate → app)
- Bootstrap admin from `.env`
- **Rich demo seed** — 180 days, ~47 products, ~900 sales — `prisma/seed.ts`
- `.gitignore` — env, uploads, backups; tracks fonts, cursor rules

---

## B. Missing Features ❌

| Requirement | Status |
|-------------|--------|
| **Daily automated backup (zero-config)** | Script provided; host cron must be configured |
| **SIM cards as dedicated product type** | Generic products only |
| **Per-employee granular permission toggle** | Role-based only (3 roles) |
| **Full integration test suite** | Unit tests for profit only |

---

## C. Partial / Known Limitations ⚠️

| Feature | Status |
|---------|--------|
| **Stock history for pre-migration data** | Movements logged from migration forward only |
| **Backup cron without auth cookie** | Cron script needs session cookie or API token |
| **Programming in POS vs Programming orders** | Two separate concepts — documented |

---

## D. Fixes Applied (2026-06-22)

1. **POS redesign** — grid + categories + quick payment
2. **Sales list page** — `/sales` with date filter + item details
3. **Programming orders** — `ProgrammingOrder` model + `/programming`
4. **Three roles** — ADMIN / ACCOUNTANT / SALES + `lib/permissions.ts`
5. **Settings** — logo upload, invoice footer, barcode toggle
6. **Shop branding** — `ShopSettings.shopName` in layout (not i18n static name)
7. **Arabic PDF** — Noto Sans Arabic fonts, A4 layout
8. **`formatMoney()`** — no forced `.00`, Latin digits
9. **Auto SKU** — `generateUniqueSku()` in inventory-service
10. **Button asChild fix** — sale detail crash after completing sale
11. **Sidebar sticky** — logout/theme buttons always visible
12. **Tajawal font** — replaced IBM Plex Sans Arabic
13. **Demo seed expanded** — 180 days, ~900 sales
14. **`.gitignore`** — uploads, backups, env; tracks fonts + cursor rules

---

## E. Remaining Gaps

- Configure daily backup cron on production host
- Backfill `StockMovement` for historical transactions (optional)
- Broader test coverage beyond profit unit tests

---

## Module Map (current)

```
app/(dashboard)/
├── dashboard/     ✅ stats (profit Admin/Accountant only)
├── pos/           ✅ grid POS + invoice detail
├── sales/         ✅ sales list + date filter
├── inventory/     ✅ products, warehouses, categories, transfers, movements
├── purchases/     ✅ Admin + Accountant
├── returns/       ✅ required links
├── customers/     ✅ debts
├── expenses/      ✅ Admin + Accountant
├── reports/       ✅ date range + all report types
├── repairs/       ✅ repair orders
├── programming/   ✅ programming orders
├── users/         ✅ admin
└── settings/      ✅ logo, invoice, backup

lib/application/services/
├── sale-service.ts
├── purchase-service.ts
├── inventory-service.ts      (+ generateUniqueSku)
├── customer-service.ts
├── report-service.ts
├── invoice-service.ts
├── user-service.ts
├── stock-movement-service.ts
├── repair-service.ts
├── programming-service.ts    ← new
└── backup-service.ts

lib/
├── permissions.ts
├── pdf/register-fonts.ts
└── utils.ts                  (+ formatMoney)
```
