-- CreateTable
CREATE TABLE "OrderArchive" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderArchive_originalId_key" ON "OrderArchive"("originalId");

-- CreateIndex
CREATE INDEX "OrderArchive_storeId_idx" ON "OrderArchive"("storeId");

-- CreateIndex
CREATE INDEX "OrderArchive_createdAt_idx" ON "OrderArchive"("createdAt");
