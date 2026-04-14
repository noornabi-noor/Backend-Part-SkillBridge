/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `isBooked` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `tutorId` on the `availability` table. All the data in the column will be lost.
  - Added the required column `endDateTime` to the `availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `availability` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "availability" DROP CONSTRAINT "availability_tutorId_fkey";

-- AlterTable
ALTER TABLE "availability" DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "isBooked",
DROP COLUMN "startTime",
DROP COLUMN "tutorId",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "availabilityId" TEXT;

-- CreateTable
CREATE TABLE "tutor_availability" (
    "tutorId" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_availability_pkey" PRIMARY KEY ("tutorId","availabilityId")
);

-- CreateIndex
CREATE INDEX "tutor_availability_tutorId_idx" ON "tutor_availability"("tutorId");

-- CreateIndex
CREATE INDEX "tutor_availability_availabilityId_idx" ON "tutor_availability"("availabilityId");

-- AddForeignKey
ALTER TABLE "tutor_availability" ADD CONSTRAINT "tutor_availability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_availability" ADD CONSTRAINT "tutor_availability_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "availability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "availability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
