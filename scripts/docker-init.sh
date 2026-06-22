#!/bin/sh
set -e

echo "Running database migrations..."
until npx prisma migrate deploy; do
  echo "Waiting for database..."
  sleep 3
done

USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count()
  .then((count) => { console.log(count); })
  .finally(() => prisma.\$disconnect());
")

if [ "$USER_COUNT" = "0" ]; then
  echo "Empty database — creating admin user from .env (ADMIN_EMAIL / ADMIN_PASSWORD)..."
  npx tsx prisma/bootstrap.ts
else
  echo "Database already has users — skipping bootstrap."
fi
