import { OmitType } from '@nestjs/mapped-types';
import { RegisterStudentDto } from './register-student.dto';

export class UpdateStudentDto extends OmitType(RegisterStudentDto, [
  'email',
  'password',
  'profileImageUrl',
] as const) {}
