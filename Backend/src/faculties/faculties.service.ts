import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { FacultyQueryDto } from './dto/faculty-query.dto';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacultyDto) {
    try {
      await this.ensureAcademicCategoryExists(dto.academicCategoryId);
      return await this.prisma.faculty.create({
        data: {
          name: dto.name.trim(),
          code: dto.code.trim().toUpperCase(),
          academicCategoryId: dto.academicCategoryId,
        },
        include: {
          academicCategory: true,
          departments: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: FacultyQueryDto) {
    return this.prisma.faculty.findMany({
      where: {
        academicCategoryId: query.academicCategoryId,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        academicCategory: true,
        departments: true,
      },
    });
  }

  async findOne(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: {
        academicCategory: true,
        departments: true,
      },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    return faculty;
  }

  async update(id: string, dto: UpdateFacultyDto) {
    await this.ensureFacultyExists(id);

    try {
      if (dto.academicCategoryId) {
        await this.ensureAcademicCategoryExists(dto.academicCategoryId);
      }
      return await this.prisma.faculty.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          code: dto.code?.trim().toUpperCase(),
          academicCategoryId: dto.academicCategoryId,
        },
        include: {
          academicCategory: true,
          departments: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.ensureFacultyExists(id);

    try {
      return await this.prisma.faculty.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Faculty name or code already exists');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete this faculty because it has related records',
        );
      }
    }
    throw error;
  }

  private async ensureFacultyExists(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    return faculty;
  }

  private async ensureAcademicCategoryExists(academicCategoryId: string) {
    const category = await this.prisma.academicCategory.findUnique({
      where: { id: academicCategoryId },
    });

    if (!category) {
      throw new NotFoundException('Academic category not found');
    }

    return category;
  }
}
