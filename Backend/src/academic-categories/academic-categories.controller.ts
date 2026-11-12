import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AcademicCategoriesService } from './academic-categories.service';
import { CreateAcademicCategoryDto } from './dto/create-academic-category.dto';
import { UpdateAcademicCategoryDto } from './dto/update-academic-category.dto';

@Controller('academic-categories')
export class AcademicCategoriesController {
  constructor(
    private readonly academicCategoriesService: AcademicCategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.academicCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicCategoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateAcademicCategoryDto) {
    return this.academicCategoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAcademicCategoryDto) {
    return this.academicCategoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicCategoriesService.remove(id);
  }
}
