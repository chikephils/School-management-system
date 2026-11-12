/*
  Warnings:

  - You are about to drop the column `falculty` on the `StaffProfile` table. All the data in the column will be lost.
  - You are about to drop the column `falculty` on the `StudentProfile` table. All the data in the column will be lost.
  - Added the required column `faculty` to the `StaffProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faculty` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StaffProfile" DROP COLUMN "falculty",
ADD COLUMN     "faculty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "falculty",
ADD COLUMN     "faculty" TEXT NOT NULL;
