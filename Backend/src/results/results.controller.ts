import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ResultsService } from './results.service';
import { SemesterResultQueryDto } from './dto/semester-result-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Get('students/:studentProfileId')
  getStudentSemesterResultForManager(
    @CurrentUser() user: JwtPayload,
    @Param('studentProfileId') studentProfileId: string,
    @Query() query: SemesterResultQueryDto,
  ) {
    return this.resultsService.getStudentSemesterResultForManager(
      user.sub,
      studentProfileId,
      query.academicSemesterId,
    );
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_ADMIN)
  @Get('students/:studentProfileId/cgpa')
  getStudentCgpaForManager(
    @CurrentUser() user: JwtPayload,
    @Param('studentProfileId') studentProfileId: string,
  ) {
    return this.resultsService.getStudentCgpaForManager(
      user.sub,
      studentProfileId,
    );
  }

  @Get('me/cgpa')
  getMyCgpa(@CurrentUser() user: JwtPayload) {
    return this.resultsService.getMyCgpa(user.sub);
  }

  @Get('me')
  getMySemesterResult(
    @CurrentUser() user: JwtPayload,
    @Query() query: SemesterResultQueryDto,
  ) {
    return this.resultsService.getMySemesterResult(
      user.sub,
      query.academicSemesterId,
    );
  }
}
