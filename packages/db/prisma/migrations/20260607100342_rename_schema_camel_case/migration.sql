/*
  Warnings:

  - You are about to drop the column `publickey` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `ValidatorId` on the `WebsiteTick` table. All the data in the column will be lost.
  - You are about to drop the column `WebsiteId` on the `WebsiteTick` table. All the data in the column will be lost.
  - Added the required column `publicKey` to the `Validator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validatorId` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `websiteId` to the `WebsiteTick` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WebsiteTick" DROP CONSTRAINT "WebsiteTick_ValidatorId_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteTick" DROP CONSTRAINT "WebsiteTick_WebsiteId_fkey";

-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "publickey",
ADD COLUMN     "publicKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WebsiteTick" DROP COLUMN "ValidatorId",
DROP COLUMN "WebsiteId",
ADD COLUMN     "validatorId" TEXT NOT NULL,
ADD COLUMN     "websiteId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WebsiteTick" ADD CONSTRAINT "WebsiteTick_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteTick" ADD CONSTRAINT "WebsiteTick_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
