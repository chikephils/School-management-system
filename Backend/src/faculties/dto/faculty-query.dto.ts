import { IsOptional, IsUUID } from 'class-validator';

export class FacultyQueryDto {
  @IsOptional()
  @IsUUID()
  academicCategoryId?: string;
}
