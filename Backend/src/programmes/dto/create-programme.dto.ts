import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ProgrammeAward } from '@prisma/client';

export class CreateProgrammeDto {
  @IsUUID()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(ProgrammeAward)
  award!: ProgrammeAward;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationYears!: number;
}
