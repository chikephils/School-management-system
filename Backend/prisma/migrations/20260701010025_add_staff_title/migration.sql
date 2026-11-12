/*
  Warnings:

  - Added the required column `StaffTitle` to the `StaffProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StaffTitle" AS ENUM ('MR', 'MRS', 'MISS', 'MS', 'DR', 'PROF', 'ASSOCIATE_PROF');

-- AlterTable
ALTER TABLE "StaffProfile" ADD COLUMN     "StaffTitle" "StaffTitle" NOT NULL;
