/*
  Warnings:

  - Added the required column `nextReviewDate` to the `UserProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "lastReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nextReviewDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;
