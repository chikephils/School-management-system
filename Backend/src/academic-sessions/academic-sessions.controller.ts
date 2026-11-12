import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AcademicSessionsService } from './academic-sessions.service';
import { CreateAcademicSemesterDto } from './dto/create-academic-semester.dto';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
import { UpdateAcademicSemesterDto } from './dto/update-academic-semester';

@Controller('academic-sessions')
export class AcademicSessionsController {
  constructor(
    private readonly academicSessionService: AcademicSessionsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  createSession(@Body() dto: CreateAcademicSessionDto) {
    return this.academicSessionService.createSession(dto);
  }

  @Get()
  findAllSessions() {
    return this.academicSessionService.findAllSessions();
  }

  @Get('semesters')
  findAllSemesters() {
    return this.academicSessionService.findAllSemesters();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('semester')
  createSemester(@Body() dto: CreateAcademicSemesterDto) {
    return this.academicSessionService.createSemester(dto);
  }

  @Get(':id')
  findOneSession(@Param('id') id: string) {
    return this.academicSessionService.findOneSession(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicSessionDto,
  ) {
    return this.academicSessionService.updateSession(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('semester/:id')
  updateSemester(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicSemesterDto,
  ) {
    return this.academicSessionService.updateSemester(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  removeSession(@Param('id') id: string) {
    return this.academicSessionService.removeSession(id);
  }
}
