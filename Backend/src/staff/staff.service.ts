import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffQueryDto } from './dto/staff-query.dto';
import { UpdateStaffDto } from '../auth/dto/update-staff-dto';
import { RegistrationStatus, UserRole } from '@prisma/client';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        lecturerCourseOfferings: {
          include: {
            course: true,
            audiences: {
              include: {
                academicCategory: true,
                faculty: true,
                department: {
                  include: {
                    faculty: true,
                  },
                },
                programme: {
                  include: {
                    department: {
                      include: {
                        faculty: true,
                      },
                    },
                  },
                },
              },
            },
            academicSemester: {
              include: {
                academicSession: true,
              },
            },
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }

    return staff;
  }

  async findAll(query: StaffQueryDto) {
    return this.prisma.staffProfile.findMany({
      where: {
        faculty: query.faculty,
        department: query.department,
        user: {
          role: query.role,
        },
      },
      orderBy: [
        {
          lastName: 'asc',
        },
        {
          firstName: 'asc',
        },
      ],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async getMyCourseOfferings(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
    });

    if (!staff) {
      throw new NotFoundException('Staff Profile not found');
    }

    return this.prisma.courseOffering.findMany({
      where: { lecturerId: staff.id },
      orderBy: {
        course: {
          code: 'asc',
        },
      },
      include: {
        course: true,

        audiences: {
          include: {
            academicCategory: true,
            faculty: true,
            department: {
              include: {
                faculty: true,
              },
            },
            programme: {
              include: {
                department: {
                  include: {
                    faculty: true,
                  },
                },
              },
            },
          },
        },
        academicSemester: {
          include: {
            academicSession: true,
          },
        },
        registrations: {
          where: {
            status: RegistrationStatus.SUBMITTED,
          },
          include: {
            studentProfile: true,
          },
        },
      },
    });
  }

  async updateStaff(id: string, dto: UpdateStaffDto) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }

    const nextRole = dto.role ?? staff.user.role;
    const nextFaculty = dto.faculty ?? staff.faculty;
    const nextDepartment = dto.department ?? staff.department;

    const departmentScopedRoles: UserRole[] = [
      UserRole.DEPARTMENT_ADMIN,
      UserRole.LECTURER,
    ];

    if (nextRole === UserRole.STUDENT) {
      throw new BadRequestException('Staff account cannot use student role');
    }

    if (nextRole === UserRole.ADMIN && !nextFaculty) {
      throw new BadRequestException('Faculty admin must have a faculty');
    }

    if (
      departmentScopedRoles.includes(nextRole) &&
      (!nextFaculty || !nextDepartment)
    ) {
      throw new BadRequestException(
        'Department admin and lecturer must have faculty and department',
      );
    }

    const faculty = nextRole === UserRole.SUPER_ADMIN ? null : nextFaculty;

    const department =
      nextRole === UserRole.SUPER_ADMIN || nextRole === UserRole.ADMIN
        ? null
        : nextDepartment;

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: staff.userId },
        data: {
          email: dto.email,
          role: dto.role,
        },
      });

      const updatedStaff = await tx.staffProfile.update({
        where: { id },
        data: {
          email: dto.email,
          staffNumber: dto.staffNumber,
          title: dto.title,
          firstName: dto.firstName,
          lastName: dto.lastName,
          otherName: dto.otherName,
          phoneNumber: dto.phoneNumber,
          faculty,
          department,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      return {
        message: 'Staff profile updated successfully',
        staff: updatedStaff,
      };
    });
  }
}
