-- AlterTable
ALTER TABLE "Category" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'READY', 'DELIVERED');

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "status" "RepairStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    CONSTRAINT "RepairOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairOrder_orderNumber_key" ON "RepairOrder"("orderNumber");
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");
CREATE INDEX "StockMovement_warehouseId_idx" ON "StockMovement"("warehouseId");
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");
CREATE INDEX "RepairOrder_status_idx" ON "RepairOrder"("status");
CREATE INDEX "RepairOrder_createdAt_idx" ON "RepairOrder"("createdAt");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
