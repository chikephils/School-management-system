import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { UpdateProgrammeDto } from './dto/update-programme.dto';
import { ProgrammeQueryDto } from './dto/dto.programme-query.dto';

@Injectable()
export class ProgrammesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProgrammeDto) {
    await this.ensureStaffCanManageDepartment(userId, dto.departmentId);

    try {
      return await this.prisma.programme.create({
        data: {
          departmentId: dto.departmentId,
          name: dto.name.trim(),
          code: dto.code.trim().toUpperCase(),
          award: dto.award,
          durationYears: dto.durationYears,
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

  async findAll(query: ProgrammeQueryDto) {
    return this.prisma.programme.findMany({
      where: {
        departmentId: query.departmentId,
      },
      orderBy: {
        name: 'asc',
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
    const programme = await this.prisma.programme.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        courseOfferingAudiences: true,
      },
    });

    if (!programme) {
      throw new NotFoundException('Programme not found');
    }
    return programme;
  }

  async update(userId: string, id: string, dto: UpdateProgrammeDto) {
    const existingProgramme = await this.findOne(id);
    const departmentIdToCheck =
      dto.departmentId ?? existingProgramme.departmentId;

    await this.ensureStaffCanManageDepartment(userId, departmentIdToCheck);

    try {
      return await this.prisma.programme.update({
        where: { id },
        data: {
          departmentId: dto.departmentId,
          name: dto.name?.trim(),
          code: dto.code?.trim().toUpperCase(),
          award: dto.award,
          durationYears: dto.durationYears,
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
      return await this.prisma.programme.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureDepartmentExists(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Programme code already exists');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete this Programme because it has related records',
        );
      }
    }
    throw error;
  }

  private async ensureStaffCanManageDepartment(
    userId: string,
    departmentId: string,
  ) {
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
      await this.ensureDepartmentExists(departmentId);
      return;
    }

    if (staff.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot manage programmes');
    }

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department.faculty.name !== staff.faculty) {
      throw new ForbiddenException(
        'You can only manage programmes in your faculty',
      );
    }
  }
}
