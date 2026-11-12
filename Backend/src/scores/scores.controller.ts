import { Controller, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdateScoreDto } from './dto/update-score.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ScoresService } from './scores.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LECTURER)
@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get('course-offerings/:courseOfferingId/students')
  findStudentsForMyCourseOffering(
    @CurrentUser() user: JwtPayload,
    @Param('courseOfferingId') courseOfferingId: string,
  ) {
    return this.scoresService.findStudentsForMyCourseOffering(
      user.sub,
      courseOfferingId,
    );
  }

  @Patch('registrations/:registrationId')
  updateScore(
    @CurrentUser() user: JwtPayload,
    @Param('registrationId') registrationId: string,
    @Body() dto: UpdateScoreDto,
  ) {
    return this.scoresService.updateScore(user.sub, registrationId, dto);
  }
}
