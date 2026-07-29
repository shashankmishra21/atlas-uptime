-- CreateTable
CREATE TABLE "MonitoringRound" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "status" "WebsiteStatus" NOT NULL,
    "latency" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonitoringRound" ADD CONSTRAINT "MonitoringRound_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
