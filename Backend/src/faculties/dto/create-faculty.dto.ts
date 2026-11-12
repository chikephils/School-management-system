import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsUUID()
  academicCategoryId!: string;
}
