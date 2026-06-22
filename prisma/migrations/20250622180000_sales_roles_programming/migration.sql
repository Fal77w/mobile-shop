-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SALES';

-- ShopSettings extensions
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "invoiceFooter" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "invoiceShowBarcode" BOOLEAN NOT NULL DEFAULT true;

-- ProgrammingOrder
CREATE TABLE IF NOT EXISTS "ProgrammingOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "status" "RepairStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "ProgrammingOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProgrammingOrder_orderNumber_key" ON "ProgrammingOrder"("orderNumber");
CREATE INDEX IF NOT EXISTS "ProgrammingOrder_status_idx" ON "ProgrammingOrder"("status");
CREATE INDEX IF NOT EXISTS "ProgrammingOrder_createdAt_idx" ON "ProgrammingOrder"("createdAt");

DO $$ BEGIN
  ALTER TABLE "ProgrammingOrder" ADD CONSTRAINT "ProgrammingOrder_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
