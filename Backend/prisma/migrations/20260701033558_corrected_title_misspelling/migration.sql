/*
  Warnings:

  - You are about to drop the column `StaffTitle` on the `StaffProfile` table. All the data in the column will be lost.
  - Added the required column `title` to the `StaffProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StaffProfile" DROP COLUMN "StaffTitle",
ADD COLUMN     "title" "StaffTitle" NOT NULL;
