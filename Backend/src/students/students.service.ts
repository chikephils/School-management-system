import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentQueryDto } from './dto/student-query.dto';
import { UserRole, Prisma } from '@prisma/client';
import { UpdateStudentDto } from '../auth/dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  //Get student profile
  async getMyProfile(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        programmeRecord: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  //Find All students
  async findAll(userId: string, query: StudentQueryDto) {
    const staff = await this.getStaffForAccess(userId);

    const filters: Prisma.StudentProfileWhereInput[] = [];

    if (query.academicCategoryId) {
      filters.push({
        programmeRecord: {
          is: {
            department: {
              is: {
                faculty: {
                  is: {
                    academicCategoryId: query.academicCategoryId,
                  },
                },
              },
            },
          },
        },
      });
    }

    if (query.facultyId) {
      filters.push({
        programmeRecord: {
          is: {
            department: {
              is: {
                facultyId: query.facultyId,
              },
            },
          },
        },
      });
    }

    if (query.departmentId) {
      filters.push({
        programmeRecord: {
          is: {
            departmentId: query.departmentId,
          },
        },
      });
    }

    if (query.programmeId) {
      filters.push({
        programmeId: query.programmeId,
      });
    }

    if (staff.user.role === UserRole.ADMIN) {
      if (!staff.faculty) {
        throw new ForbiddenException('Faculty admin has no assigned faculty');
      }

      filters.push({
        programmeRecord: {
          is: {
            department: {
              is: {
                faculty: {
                  is: {
                    name: staff.faculty,
                  },
                },
              },
            },
          },
        },
      });
    }

    if (staff.user.role === UserRole.DEPARTMENT_ADMIN) {
      if (!staff.department) {
        throw new ForbiddenException(
          'Department admin has no assigned department',
        );
      }

      filters.push({
        programmeRecord: {
          is: {
            department: {
              is: {
                name: staff.department,
              },
            },
          },
        },
      });
    }

    const students = await this.prisma.studentProfile.findMany({
      where: {
        AND: filters,
        level: query.level,
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
          },
        },
        programmeRecord: {
          include: {
            department: {
              include: {
                faculty: {
                  include: {
                    academicCategory: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return students.map((student) => ({
      ...student,
      academicCategoryId:
        student.programmeRecord?.department.faculty.academicCategoryId ?? null,
      facultyId: student.programmeRecord?.department.faculty.id ?? null,
      departmentId: student.programmeRecord?.department.id ?? null,
      programmeId: student.programmeId ?? null,
    }));
  }

  async findOneForStaff(userId: string, studentProfileId: string) {
    const staff = await this.getStaffForAccess(userId);

    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        programmeRecord: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    if (
      staff.user.role === UserRole.ADMIN &&
      student.faculty !== staff.faculty
    ) {
      throw new ForbiddenException(
        'You can only view students in your faculty',
      );
    }

    if (
      staff.user.role === UserRole.DEPARTMENT_ADMIN &&
      student.department !== staff.department
    ) {
      throw new ForbiddenException(
        'You can only view students in your department',
      );
    }

    return student;
  }

  private async getStaffForAccess(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }
    return staff;
  }

  async updateStudent(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const programme = await this.prisma.programme.findUnique({
      where: {
        id: dto.programmeId,
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });

    if (!programme) {
      throw new NotFoundException('Programme not found');
    }

    return this.prisma.studentProfile.update({
      where: {
        id,
      },

      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        otherName: dto.otherName,
        matricNumber: dto.matricNumber,
        gender: dto.gender,
        dateOfBirth: new Date(dto.dateOfBirth),
        phoneNumber: dto.phoneNumber,
        level: dto.level,
        admissionYear: dto.admissionYear,
        programmeId: programme.id,
        programme: programme.name,
        department: programme.department.name,
        faculty: programme.department.faculty.name,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        programmeRecord: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });
  }
}
