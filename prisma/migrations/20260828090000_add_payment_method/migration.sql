-- Kapıda ödeme desteği: siparişin ödeme yöntemi
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'CASH_ON_DELIVERY');

ALTER TABLE "Order"
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ONLINE';
