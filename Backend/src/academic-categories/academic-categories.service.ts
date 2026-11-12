import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicCategoryDto } from './dto/create-academic-category.dto';
import { UpdateAcademicCategoryDto } from './dto/update-academic-category.dto';

@Injectable()
export class AcademicCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcademicCategoryDto) {
    try {
      return await this.prisma.academicCategory.create({
        data: {
          name: dto.name.trim(),
          code: dto.code.trim().toUpperCase(),
          description: dto.description?.trim(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.academicCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        faculties: {
          select: {
            id: true,
            name: true,
            code: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.academicCategory.findUnique({
      where: { id },
      include: {
        faculties: {
          select: {
            id: true,
            name: true,
            code: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Academic category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateAcademicCategoryDto) {
    await this.findOne(id);

    try {
      return await this.prisma.academicCategory.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          code: dto.code?.trim().toUpperCase(),
          description: dto.description?.trim(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.academicCategory.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'An academic category with this name or code already exists',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'This academic category cannot be deleted because it has faculties',
        );
      }
    }

    throw error;
  }
}
