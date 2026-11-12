import {
  Controller,
  Body,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CourseRegistrationsService } from './course-registrations.service';
import { RegisterCourseDto } from './dto/register-course.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Controller('course-registrations')
export class CourseRegistrationsController {
  constructor(
    private readonly courseRegistrationsService: CourseRegistrationsService,
  ) {}

  @Post()
  registerCourse(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterCourseDto,
  ) {
    return this.courseRegistrationsService.registerCourse(
      user.sub,
      dto.courseOfferingId,
    );
  }

  @Get('me')
  findMyRegistrations(@CurrentUser() user: JwtPayload) {
    return this.courseRegistrationsService.findMyRegistrations(user.sub);
  }

  @Get('available')
  findAvailableCourses(@CurrentUser() user: JwtPayload) {
    return this.courseRegistrationsService.findAvailableCourses(user.sub);
  }

  @Post('submit')
  submitMyRegistration(@CurrentUser() user: JwtPayload) {
    return this.courseRegistrationsService.submitMyRegistration(user.sub);
  }

  @Delete(':registrationId')
  removeMyDraftRegistration(
    @CurrentUser() user: JwtPayload,
    @Param('registrationId') registrationId: string,
  ) {
    return this.courseRegistrationsService.removeMyDraftRegistration(
      user.sub,
      registrationId,
    );
  }

  @Get('draft-summary')
  getMyDraftSummary(@CurrentUser() user: JwtPayload) {
    return this.courseRegistrationsService.getMyDraftSummary(user.sub);
  }
}
