import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicCategoryDto } from './create-academic-category.dto';

export class UpdateAcademicCategoryDto extends PartialType(
  CreateAcademicCategoryDto,
) {}
