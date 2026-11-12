/*
  Warnings:

  - You are about to drop the column `departmentId` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the column `programmeId` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the `faculty` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "CourseOfferingScope" ADD VALUE 'ACADEMIC_CATEGORY';

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_programmeId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_facultyId_fkey";

-- AlterTable
ALTER TABLE "CourseOffering" DROP COLUMN "departmentId",
DROP COLUMN "facultyId",
DROP COLUMN "programmeId",
ALTER COLUMN "scope" DROP DEFAULT;

-- DropTable
DROP TABLE "faculty";

-- CreateTable
CREATE TABLE "AcademicCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "academicCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOfferingAudience" (
    "id" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "academicCategoryId" TEXT,
    "facultyId" TEXT,
    "departmentId" TEXT,
    "programmeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseOfferingAudience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCategory_name_key" ON "AcademicCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicCategory_code_key" ON "AcademicCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_code_key" ON "Faculty"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOfferingAudience_courseOfferingId_academicCategoryId_key" ON "CourseOfferingAudience"("courseOfferingId", "academicCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOfferingAudience_courseOfferingId_facultyId_key" ON "CourseOfferingAudience"("courseOfferingId", "facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOfferingAudience_courseOfferingId_departmentId_key" ON "CourseOfferingAudience"("courseOfferingId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOfferingAudience_courseOfferingId_programmeId_key" ON "CourseOfferingAudience"("courseOfferingId", "programmeId");

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_academicCategoryId_fkey" FOREIGN KEY ("academicCategoryId") REFERENCES "AcademicCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOfferingAudience" ADD CONSTRAINT "CourseOfferingAudience_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOfferingAudience" ADD CONSTRAINT "CourseOfferingAudience_academicCategoryId_fkey" FOREIGN KEY ("academicCategoryId") REFERENCES "AcademicCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOfferingAudience" ADD CONSTRAINT "CourseOfferingAudience_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOfferingAudience" ADD CONSTRAINT "CourseOfferingAudience_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOfferingAudience" ADD CONSTRAINT "CourseOfferingAudience_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
