-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "currentStatus" "WebsiteStatus",
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "lastLatency" DOUBLE PRECISION;
