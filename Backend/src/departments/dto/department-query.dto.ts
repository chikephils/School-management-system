import { IsOptional, IsUUID } from 'class-validator';

export class DepartmentQueryDto {
  @IsOptional()
  @IsUUID()
  facultyId?: string;
}
