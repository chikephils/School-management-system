import { OmitType } from '@nestjs/mapped-types';
import { RegisterStaffDto } from './register-staff.dto';

export class UpdateStaffDto extends OmitType(RegisterStaffDto, [
  'profileImageUrl',
  'password',
] as const) {}
