import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicSemesterDto } from './create-academic-semester.dto';

export class UpdateAcademicSemesterDto extends PartialType(
  CreateAcademicSemesterDto,
) {}
