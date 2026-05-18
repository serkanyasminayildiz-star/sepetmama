/*
  Warnings:

  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFullName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "consents" JSONB,
ADD COLUMN     "failedReason" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "shippingAddress" TEXT NOT NULL,
ADD COLUMN     "shippingEmail" TEXT NOT NULL,
ADD COLUMN     "shippingFullName" TEXT NOT NULL,
ADD COLUMN     "shippingPhone" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "addressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
