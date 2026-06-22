# moblies-shop — System Audit & Gap Analysis

**Date:** 2026-06-21 (updated after fix implementation)  
**Stack:** Next.js 16, PostgreSQL 16, Prisma 6, Auth.js, next-intl

---

## A. Implemented Features ✅

### Auth & Users
- Login (Credentials + JWT + bcrypt) — `lib/auth.ts`
- Roles: `ADMIN`, `EMPLOYEE` — `User.role`
- Admin-only routes: `/users`, `/settings`, `/purchases`, `/expenses` (middleware + `requireAdmin()`)
- Employee CRUD (Admin) — `app/(dashboard)/users/`
- **RBAC permissions** — `lib/permissions.ts` (`canViewFinancials`, `canEditCostPrice`, `canViewProfitReports`, `canManageBackup`)

### Sales / POS
- Fast POS with product search — `/pos`
- Cart, qty edit, payment methods (Cash / Card / On Account)
- Auto stock deduction on sale — `sale-service.ts` (`$transaction`)
- **Stock movement logged** on sale — `StockMovement` type `SALE`
- A4 printable invoice PDF — `/api/invoices/[id]/pdf` (selling price only)
- Sale detail page with print button — `/pos/sales/[id]`
- Invoice auto-numbering — `InvoiceSequence` + `ShopSettings.invoicePrefix`
- `costPriceSnapshot` on `SaleItem` for profit history

### Inventory
- Products (SKU, barcode, cost/selling price, qty, low stock alert)
- **Subcategories** — `Category.parentId` + UI on `/inventory/categories`
- Multiple warehouses — `/inventory/warehouses`
- Stock transfers between warehouses — `/inventory/transfers`
- **Stock movement history (IN/OUT ledger)** — `/inventory/movements`
- Low stock query — `getLowStockProducts()`
- Programming services as **products** in "Programming" category

### Purchases
- Supplier purchases with invoice number — `/purchases` (Admin only)
- Auto stock increase + movement log — `purchase-service.ts`
- Purchase history table

### Returns
- Sales returns (restore stock, **required link to sale**) — `/returns`
- Purchase returns (reduce stock, **required link to purchase**) — `/returns`
- Debt adjustment on ON_ACCOUNT sale returns
- Stock movement logging on all returns

### Expenses
- CRUD expenses — `/expenses` (Admin only)
- Used in net profit calculation

### Debts / Customers
- Customer CRUD — `/customers`
- ON_ACCOUNT sales increase `totalDebt`
- Payment recording — `/customers/[id]`
- Customer statement: purchases, paid, remaining

### Reports
- Daily sales (today)
- Monthly sales (current month)
- **Custom date range sales** — query params + filter UI
- Gross / net profit, by warehouse, by category (Admin only)
- **Profit per item** (Admin only)
- **Inventory valuation** (Admin only)
- Debt report, expense report, low stock report
- **Repair income + common issues** report
- **Programming services income** (Admin only, filters Programming category)
- Dashboard stats (profit hidden from Employee)

### Repair Department
- `RepairOrder` model with status workflow (New → In progress → Ready → Delivered)
- CRUD UI — `/repairs`
- Repair income report in `/reports`

### Backup System
- Manual export — `GET /api/backup` (Admin)
- Manual restore — `POST /api/backup` (Admin)
- Settings UI backup panel — `/settings`
- Cron helper script — `scripts/backup-cron.sh`

### i18n
- Arabic (RTL) + English — full keys for new modules
- Language switcher, user locale in DB

### Deploy
- Docker Compose (postgres → migrate → app)
- Bootstrap admin from `.env`
- Rich demo seed (90 days history)

---

## B. Missing Features ❌

| Requirement | Status |
|-------------|--------|
| **Daily automated backup (zero-config)** | Script provided; host cron / Docker sidecar must be configured manually |
| **Dedicated programming service orders** | Sold as stock products — no separate service-order workflow |
| **SIM cards as dedicated product type** | Generic products only |
| **Explicit warehouse sections enum** | Achieved via categories (Samsung/iPhone/Accessories) |
| **Per-employee financial permission toggle** | Binary Admin vs Employee only |
| **Full integration test suite** | Unit tests for profit only |

---

## C. Partial / Broken Features ⚠️ (post-fix status)

| Feature | Status |
|---------|--------|
| **Cost price hidden from employees** | ✅ Fixed — product form, search API, dashboard profit, profit reports |
| **Employee financial access** | ✅ Fixed — profit/valuation tabs Admin-only; purchases/expenses Admin-only |
| **Returns linking** | ✅ Fixed — saleId/purchaseId required in validation + UI |
| **Reports i18n** | ✅ Fixed — all report labels use next-intl |
| **Invoice PDF i18n** | ⚠️ Still English-only labels in PDF route |
| **Programming services workflow** | ⚠️ Products with qty 999 — income report added |
| **Stock history for pre-migration data** | ⚠️ Movements logged from fix forward only |
| **Backup cron without auth cookie** | ⚠️ Cron script needs session cookie or API token |

---

## D. Fixes Applied (2026-06-21)

1. **`lib/permissions.ts`** — financial RBAC helpers
2. **Prisma migration** — `StockMovement`, `RepairOrder`, `Category.parentId`
3. **Stock movement logging** — sale, purchase, return, transfer services
4. **`/inventory/movements`** — unified IN/OUT ledger page
5. **`/repairs`** — repair orders module + status workflow
6. **Reports enhancements** — date range, profit by item, valuation, repair/programming reports
7. **Backup export/restore** — API + Settings panel + cron script
8. **Employee UI restrictions** — cost price, profit stats, financial tabs
9. **Returns** — mandatory invoice linking
10. **Subcategory UI** — parent category on categories page
11. **i18n** — `repairs`, `movements`, extended `reports`, `settings.backup`

---

## E. Remaining Gaps

- Configure daily backup cron on production host (see `scripts/backup-cron.sh`)
- Invoice PDF Arabic labels (optional enhancement)
- Backfill `StockMovement` rows for historical transactions (optional migration script)
- Dedicated programming/repair service orders (future enhancement)
- Per-employee granular permissions beyond Admin/Employee roles

---

## Module Map (current)

```
app/(dashboard)/
├── dashboard/     ✅ stats (profit Admin-only)
├── pos/           ✅ POS + invoice
├── inventory/     ✅ products, warehouses, categories, transfers, movements
├── purchases/     ✅ Admin only
├── returns/       ✅ required links
├── customers/     ✅ debts
├── expenses/      ✅ Admin only
├── reports/       ✅ date range + all report types
├── repairs/       ✅ new
├── users/         ✅ admin
└── settings/      ✅ + backup panel

lib/application/services/
├── sale-service.ts
├── purchase-service.ts
├── inventory-service.ts
├── customer-service.ts
├── report-service.ts
├── invoice-service.ts
├── user-service.ts
├── stock-movement-service.ts
├── repair-service.ts
└── backup-service.ts
```
