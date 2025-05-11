-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'WAITING_APPROVAL';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "paymentQrCode" TEXT;
