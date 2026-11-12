import { IsUUID } from 'class-validator';

export class RegisterCourseDto {
  @IsUUID()
  courseOfferingId!: string;
}
