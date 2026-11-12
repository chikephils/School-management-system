-- CreateEnum
CREATE TYPE "CourseOfferingScope" AS ENUM ('UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'PROGRAMME');

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_academicSemesterId_fkey";

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseOffering" DROP CONSTRAINT "CourseOffering_programmeId_fkey";

-- DropIndex
DROP INDEX "CourseOffering_courseId_programmeId_academicSemesterId_key";

-- AlterTable
ALTER TABLE "CourseOffering" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "scope" "CourseOfferingScope" NOT NULL DEFAULT 'PROGRAMME',
ALTER COLUMN "programmeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_academicSemesterId_fkey" FOREIGN KEY ("academicSemesterId") REFERENCES "AcademicSemester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
