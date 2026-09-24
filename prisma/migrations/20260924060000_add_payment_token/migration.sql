-- iyzico callback'te ödeme doğrulanamazsa siparişi token ile bulabilmek için
ALTER TABLE "Order" ADD COLUMN "paymentToken" TEXT;
CREATE UNIQUE INDEX "Order_paymentToken_key" ON "Order"("paymentToken");
