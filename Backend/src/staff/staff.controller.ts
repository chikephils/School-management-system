import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { StaffQueryDto } from './dto/staff-query.dto';
import { StaffService } from './staff.service';
import { UpdateStaffDto } from '../auth/dto/update-staff-dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.DEPARTMENT_ADMIN,
  UserRole.LECTURER,
)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles(UserRole.LECTURER)
  @Get('me/course-offerings')
  getMyCourseOfferings(@CurrentUser() user: JwtPayload) {
    return this.staffService.getMyCourseOfferings(user.sub);
  }

  @Get('me')
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.staffService.getMyProfile(user.sub);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Get()
  findAll(@Query() query: StaffQueryDto) {
    return this.staffService.findAll(query);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.updateStaff(id, dto);
  }
}
