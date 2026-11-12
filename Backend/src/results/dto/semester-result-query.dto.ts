import { IsOptional, IsUUID } from 'class-validator';

export class SemesterResultQueryDto {
  @IsOptional()
  @IsUUID()
  academicSemesterId?: string;
}
