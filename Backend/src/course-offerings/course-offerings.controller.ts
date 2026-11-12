import {
  Controller,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CourseOfferingsService } from './course-offerings.service';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { UpdateCourseOfferingDto } from './dto/update-course-offering.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('course-offerings')
export class CourseOfferingsController {
  constructor(
    private readonly courseOfferingsService: CourseOfferingsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCourseOfferingDto,
  ) {
    return this.courseOfferingsService.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.courseOfferingsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseOfferingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCourseOfferingDto,
  ) {
    return this.courseOfferingsService.update(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseOfferingsService.remove(id);
  }
}
