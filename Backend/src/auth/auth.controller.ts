import { Controller, Body, Post, Get, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { Roles } from './decorators/roles.decorator';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RolesGuard } from './guards/roles.guard';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-student')
  registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('register-staff')
  registerStaff(@Body() dto: RegisterStaffDto) {
    return this.authService.registerStaff(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
