import {
  Controller,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { UpdateProgrammeDto } from './dto/update-programme.dto';
import { ProgrammesService } from './programmes.service';
import { ProgrammeQueryDto } from './dto/dto.programme-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('programmes')
export class ProgrammesController {
  constructor(private readonly programmesService: ProgrammesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProgrammeDto) {
    return this.programmesService.create(user.sub, dto);
  }

  @Get()
  findAll(@Query() query: ProgrammeQueryDto) {
    return this.programmesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programmesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProgrammeDto,
  ) {
    return this.programmesService.update(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programmesService.remove(id);
  }
}
