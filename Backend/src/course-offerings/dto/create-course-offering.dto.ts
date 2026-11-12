import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { CourseOfferingScope } from '@prisma/client';

export class CreateCourseOfferingDto {
  @IsUUID()
  courseId!: string;

  @IsUUID()
  academicSemesterId!: string;

  @IsEnum(CourseOfferingScope)
  scope!: CourseOfferingScope;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  audienceIds?: string[];

  @IsOptional()
  @IsUUID()
  lecturerId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(100)
  level!: number;

  @IsOptional()
  @IsBoolean()
  registrationOpen?: boolean;
}
