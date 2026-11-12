import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDepartmentDto) {
    await this.ensureStaffCanManageFaculty(userId, dto.facultyId);

    try {
      return await this.prisma.department.create({
        data: {
          facultyId: dto.facultyId,
          name: dto.name.trim(),
          code: dto.code.trim().toUpperCase(),
        },
        include: {
          faculty: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: DepartmentQueryDto) {
    return this.prisma.department.findMany({
      where: {
        facultyId: query.facultyId,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        faculty: true,
        programmes: true,
      },
    });
  }

  async findByAdminFaculty(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }
    if (staff.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only faculty admin can access their faculty departments',
      );
    }

    if (!staff.faculty) {
      throw new NotFoundException('Admin fcaulty not found');
    }

    return this.prisma.department.findMany({
      where: {
        faculty: {
          name: staff.faculty,
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        faculty: true,
        programmes: true,
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        faculty: true,
        programmes: true,
        courses: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(userId: string, id: string, dto: UpdateDepartmentDto) {
    const existingDepartment = await this.findOne(id);
    const facultyIdToCheck = dto.facultyId ?? existingDepartment.facultyId;

    await this.ensureStaffCanManageFaculty(userId, facultyIdToCheck);

    try {
      return await this.prisma.department.update({
        where: { id },
        data: {
          facultyId: dto.facultyId,
          name: dto.name?.trim(),
          code: dto.code?.trim().toUpperCase(),
        },
        include: {
          faculty: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureFacultyExists(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    return faculty;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Department code already exists');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete this department because it has related records',
        );
      }
    }
    throw error;
  }

  private async ensureStaffCanManageFaculty(userId: string, facultyId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }

    if (staff.user.role === UserRole.SUPER_ADMIN) {
      await this.ensureFacultyExists(facultyId);
      return;
    }

    if (staff.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot manage departments');
    }

    const faculty = await this.ensureFacultyExists(facultyId);

    if (faculty.name !== staff.faculty) {
      throw new ForbiddenException(
        'You can only manage departments in your faculty',
      );
    }
  }
}
