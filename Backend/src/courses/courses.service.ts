import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course-dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCourseDto) {
    await this.eusureDepartmentExists(dto.departmentId);
    await this.ensureStaffCanManageDepartment(userId, dto.departmentId);

    try {
      return await this.prisma.course.create({
        data: {
          departmentId: dto.departmentId,
          code: dto.code.trim().toUpperCase(),
          title: dto.title.trim(),
          creditUnit: dto.creditUnit,
          level: dto.level,
          category: dto.category,
        },
        include: {
          department: {
            include: {
              faculty: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    const where =
      staff?.user.role === UserRole.ADMIN
        ? {
            department: {
              faculty: {
                name: staff.faculty ?? undefined,
              },
            },
          }
        : staff?.user.role === UserRole.DEPARTMENT_ADMIN
          ? {
              department: {
                name: staff.department ?? undefined,
              },
            }
          : {};
    return this.prisma.course.findMany({
      where,
      orderBy: {
        code: 'asc',
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        offerings: true,
      },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(userId: string, id: string, dto: UpdateCourseDto) {
    const existingCourse = await this.findOne(id);
    const departmentIdToCheck = dto.departmentId ?? existingCourse.departmentId;

    await this.ensureStaffCanManageDepartment(userId, departmentIdToCheck);

    if (dto.departmentId) {
      await this.eusureDepartmentExists(dto.departmentId);
    }

    try {
      return await this.prisma.course.update({
        where: { id },
        data: {
          departmentId: dto.departmentId,
          code: dto.code?.trim().toUpperCase(),
          title: dto.title?.trim(),
          creditUnit: dto.creditUnit,
          level: dto.level,
          category: dto.category,
        },
        include: {
          department: {
            include: {
              faculty: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.course.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async eusureDepartmentExists(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  private async ensureStaffCanManageDepartment(
    userId: string,
    departmentId: string,
  ) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!staff) {
      return;
    }

    if (staff.user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: { faculty: true },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (
      staff.user.role === UserRole.ADMIN &&
      department.faculty.name !== staff.faculty
    ) {
      throw new ForbiddenException(
        'You can only manage courses in your faculty',
      );
    }

    if (
      staff.user.role === UserRole.DEPARTMENT_ADMIN &&
      department.name !== staff.department
    ) {
      throw new ForbiddenException(
        'You can only manage courses in your department',
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Course code already exists');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete this course because it has related records',
        );
      }
    }
    throw error;
  }
}
