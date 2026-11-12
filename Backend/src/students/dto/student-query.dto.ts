import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class StudentQueryDto {
  @IsOptional()
  @IsUUID()
  academicCategoryId?: string;

  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  programmeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  level?: number;
}
