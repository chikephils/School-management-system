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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { Roles } from '../auth/decorators/roles.decorator';

import { StudentsService } from './students.service';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from '../auth/dto/update-student.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DEPARTMENT_ADMIN,
    UserRole.LECTURER,
  )
  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: StudentQueryDto) {
    return this.studentsService.findAll(user.sub, query);
  }

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DEPARTMENT_ADMIN,
    UserRole.LECTURER,
  )
  @Get('me')
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.studentsService.getMyProfile(user.sub);
  }

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DEPARTMENT_ADMIN,
    UserRole.LECTURER,
  )
  @Get(':id')
  findOneForStaff(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studentsService.findOneForStaff(user.sub, id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.updateStudent(id, dto);
  }
}
