import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SemesterType } from '@prisma/client';

export class CreateAcademicSemesterDto {
  @IsUUID()
  academicSessionId!: string;

  @IsEnum(SemesterType)
  type!: SemesterType;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsBoolean()
  registrationOpen?: boolean;
}
