-- CreateEnum
CREATE TYPE "CourseGrade" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- AlterTable
ALTER TABLE "CourseRegistration" ADD COLUMN     "caScore" DOUBLE PRECISION,
ADD COLUMN     "examScore" DOUBLE PRECISION,
ADD COLUMN     "grade" "CourseGrade",
ADD COLUMN     "gradePoint" DOUBLE PRECISION,
ADD COLUMN     "scoreUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "scoreUpdatedById" TEXT,
ADD COLUMN     "totalScore" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "CourseRegistration" ADD CONSTRAINT "CourseRegistration_scoreUpdatedById_fkey" FOREIGN KEY ("scoreUpdatedById") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
