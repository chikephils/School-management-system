/*
  Warnings:

  - Added the required column `award` to the `Programme` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgrammeAward" AS ENUM ('BSC', 'BA', 'BED', 'MSC', 'MA', 'MBA', 'PHD', 'PGD');

-- AlterTable
ALTER TABLE "Programme" ADD COLUMN     "award" "ProgrammeAward" NOT NULL;
