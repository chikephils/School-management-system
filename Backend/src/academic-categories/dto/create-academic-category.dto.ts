import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAcademicCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
