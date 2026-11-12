import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsUUID()
  facultyId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
