import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  IsUUID,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class RegisterStudentDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  matricNumber!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsString()
  otherName?: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  profileImageUrl!: string;

  @IsUUID()
  programmeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(100)
  level!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  admissionYear!: number;
}
