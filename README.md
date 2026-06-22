# moblies-shop — POS & Inventory

نظام نقاط بيع وإدارة مخزون لمتجر موبايلات صغير.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL 16 + Prisma 6
- Auth.js (JWT + bcrypt) — Admin / Employee
- Tailwind CSS 4 + Radix UI
- next-intl (Arabic RTL / English)

## Quick Start

### Docker (recommended)

```bash
cp .env.example .env
# Set AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_URL

docker compose up -d --build
```

Open **http://localhost:3022**

### Local

```bash
cp .env.example .env
# Set DATABASE_URL, AUTH_SECRET, ADMIN_*

npm install
npx prisma migrate deploy
npm run db:bootstrap
npm run dev
```

Open **http://localhost:3000**

## Documentation

| Document | Description |
|----------|-------------|
| [docs/GUIDE.md](docs/GUIDE.md) | **Full Arabic guide** — what was built + how to use |
| [docs/RUN.md](docs/RUN.md) | Quick run guide (Arabic) |

## Roles

- **Admin**: full access + Users + Settings
- **Employee**: everything except Users & Settings

## Demo Data

```bash
npm run docker:seed
```

## Project Structure

```
app/(dashboard)/   → pages (POS, inventory, reports...)
lib/application/   → business services
prisma/            → schema + migrations + bootstrap
messages/          → ar.json, en.json
public/            → required for Docker build
```
