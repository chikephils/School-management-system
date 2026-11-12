import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CourseCategory } from '@prisma/client';

export class CreateCourseDto {
  @IsUUID()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  creditUnit!: number;

  @Type(() => Number)
  @IsInt()
  @Min(100)
  level!: number;

  @IsEnum(CourseCategory)
  category!: CourseCategory;
}
