/*
  Warnings:

  - Added the required column `pricePerHour` to the `tutor_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tutor_profiles" ADD COLUMN     "pricePerHour" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
