# moblies-shop

نظام نقاط بيع وإدارة مخزون لمتجر موبايلات صغير.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL 16 + Prisma 6
- Auth.js (JWT + bcrypt) — Admin / Accountant / Sales
- Tailwind CSS 4 + Radix UI + Tajawal (Arabic)
- next-intl (Arabic RTL / English)
- @react-pdf/renderer — A4 invoices with Noto Sans Arabic

## Quick Start

### Docker Compose (recommended)

```bash
cp .env.example .env
# Required: AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_URL

docker compose up -d --build
```

Open **http://localhost:3022** — login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`

**Demo data (Arabic, ~800 sales / 180 days):**

```bash
docker compose --profile demo run --rm seed
# or: npm run docker:seed
```

Demo employee: `employee@demo.shop` / `employee123`

See [docs/RUN.md](docs/RUN.md) for full Docker guide (logs, restart, troubleshooting).

### Local

```bash
cp .env.example .env
# Set DATABASE_URL, AUTH_URL=http://localhost:3002, AUTH_SECRET, ADMIN_*

npm install
npx prisma migrate deploy
npm run db:bootstrap
npm run dev:clean -- --port 3002
```

Open **http://localhost:3002**

## Documentation

| Document | Description |
|----------|-------------|
| [docs/GUIDE.md](docs/GUIDE.md) | **Full Arabic guide** — architecture + usage |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Development changelog (latest features) |
| [docs/RUN.md](docs/RUN.md) | Quick run guide (Arabic) |
| [docs/AUDIT.md](docs/AUDIT.md) | System audit & gap analysis |

## Roles

| Role | Access |
|------|--------|
| **Admin** | Full access + Users + Settings + Backup |
| **Accountant** | + Purchases + Expenses + Financial reports |
| **Sales** / **Employee** | POS, sales, inventory, customers, repairs, programming |

## Demo Data

```bash
# Docker (after compose up)
docker compose --profile demo run --rm seed
npm run docker:seed

# Local dev
npm run db:seed
```

~47 Arabic products, ~800+ sales over 180 days — `employee@demo.shop` / `employee123`

## Key Features

- POS with product grid, category tabs, quick payment buttons
- Sales list with date filter and line-item details
- Repairs & Programming order workflows
- Auto SKU generation, shop branding (name + logo)
- Arabic PDF invoices (A4)
- Role-based permissions (`lib/permissions.ts`)

## Project Structure

```
app/(dashboard)/   → pages (POS, sales, inventory, reports...)
lib/application/   → business services
lib/permissions.ts → role helpers
prisma/            → schema + migrations + bootstrap + seed
messages/          → ar.json, en.json
public/fonts/      → Noto Sans Arabic (PDF)
public/uploads/    → shop logo (gitignored)
.cursor/rules/     → Cursor project rules
```
