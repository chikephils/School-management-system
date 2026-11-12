import { IsOptional, IsUUID } from 'class-validator';

export class ProgrammeQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
