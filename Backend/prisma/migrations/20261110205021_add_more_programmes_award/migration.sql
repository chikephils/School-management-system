-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProgrammeAward" ADD VALUE 'LLB';
ALTER TYPE "ProgrammeAward" ADD VALUE 'MBBS';
ALTER TYPE "ProgrammeAward" ADD VALUE 'BDS';
ALTER TYPE "ProgrammeAward" ADD VALUE 'PharmD';
ALTER TYPE "ProgrammeAward" ADD VALUE 'BNSC';
ALTER TYPE "ProgrammeAward" ADD VALUE 'BMLS';
