-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- AlterTable
ALTER TABLE "CourseRegistration" ADD COLUMN     "status" "RegistrationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3);
