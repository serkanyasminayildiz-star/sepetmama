/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "CategoryProduct" (
    "categoryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CategoryProduct_pkey" PRIMARY KEY ("categoryId","productId")
);

-- AddForeignKey
ALTER TABLE "CategoryProduct" ADD CONSTRAINT "CategoryProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProduct" ADD CONSTRAINT "CategoryProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
