import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseOfferingScope, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { UpdateCourseOfferingDto } from './dto/update-course-offering.dto';

@Injectable()
export class CourseOfferingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCourseOfferingDto) {
    await this.ensureCourseExists(dto.courseId);
    await this.ensureAcademicSemesterExists(dto.academicSemesterId);

    await this.validateOfferingScope(dto.scope, dto.audienceIds);
    await this.ensureStaffCanManageOfferingScope(
      userId,
      dto.scope,
      dto.audienceIds ?? [],
    );

    if (dto.lecturerId) {
      await this.ensureLecturerExists(dto.lecturerId);
    }

    try {
      return await this.prisma.courseOffering.create({
        data: {
          courseId: dto.courseId,
          academicSemesterId: dto.academicSemesterId,
          lecturerId: dto.lecturerId,
          scope: dto.scope,
          level: dto.level,
          registrationOpen: dto.registrationOpen ?? false,
          audiences: {
            create: this.buildAudienceCreateData(
              dto.scope,
              dto.audienceIds ?? [],
            ),
          },
        },
        include: this.courseOfferingInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async validateOfferingScope(
    scope: CourseOfferingScope,
    audienceIds?: string[],
  ) {
    if (scope === CourseOfferingScope.UNIVERSITY) {
      if (audienceIds && audienceIds.length > 0) {
        throw new BadRequestException(
          'University-wide offerings must not have selected audiences',
        );
      }

      return;
    }

    if (!audienceIds || audienceIds.length === 0) {
      throw new BadRequestException(
        'This course offering scope requires at least one audience',
      );
    }

    let matchingAudienceCount = 0;

    if (scope === CourseOfferingScope.ACADEMIC_CATEGORY) {
      matchingAudienceCount = await this.prisma.academicCategory.count({
        where: {
          id: { in: audienceIds },
        },
      });
    }

    if (scope === CourseOfferingScope.FACULTY) {
      matchingAudienceCount = await this.prisma.faculty.count({
        where: {
          id: { in: audienceIds },
        },
      });
    }

    if (scope === CourseOfferingScope.DEPARTMENT) {
      matchingAudienceCount = await this.prisma.department.count({
        where: {
          id: { in: audienceIds },
        },
      });
    }

    if (scope === CourseOfferingScope.PROGRAMME) {
      matchingAudienceCount = await this.prisma.programme.count({
        where: {
          id: { in: audienceIds },
        },
      });
    }

    if (matchingAudienceCount !== audienceIds.length) {
      throw new NotFoundException(
        'One or more selected course-offering audiences do not exist',
      );
    }
  }

  private buildAudienceCreateData(
    scope: CourseOfferingScope,
    audienceIds: string[],
  ): Prisma.CourseOfferingAudienceCreateWithoutCourseOfferingInput[] {
    if (scope === CourseOfferingScope.UNIVERSITY) {
      return [];
    }

    if (scope === CourseOfferingScope.ACADEMIC_CATEGORY) {
      return audienceIds.map((id) => ({
        academicCategory: {
          connect: { id },
        },
      }));
    }

    if (scope === CourseOfferingScope.FACULTY) {
      return audienceIds.map((id) => ({
        faculty: {
          connect: { id },
        },
      }));
    }

    if (scope === CourseOfferingScope.DEPARTMENT) {
      return audienceIds.map((id) => ({
        department: {
          connect: { id },
        },
      }));
    }

    return audienceIds.map((id) => ({
      programme: {
        connect: { id },
      },
    }));
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

  private async ensureFacultyExists(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    return faculty;
  }

  private async ensureStaffCanManageOfferingScope(
    userId: string,
    scope: CourseOfferingScope,
    audienceIds: string[],
  ) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!staff) {
      throw new ForbiddenException('Staff profile not found');
    }

    if (staff.user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (
      scope === CourseOfferingScope.UNIVERSITY ||
      scope === CourseOfferingScope.ACADEMIC_CATEGORY
    ) {
      throw new ForbiddenException(
        'Only super admin can manage university-wide or academic-category offerings',
      );
    }

    if (staff.user.role === UserRole.ADMIN) {
      if (!staff.faculty) {
        throw new ForbiddenException('Faculty admin has no assigned faculty');
      }

      let allowedCount = 0;

      if (scope === CourseOfferingScope.FACULTY) {
        allowedCount = await this.prisma.faculty.count({
          where: {
            id: { in: audienceIds },
            name: staff.faculty,
          },
        });
      }

      if (scope === CourseOfferingScope.DEPARTMENT) {
        allowedCount = await this.prisma.department.count({
          where: {
            id: { in: audienceIds },
            faculty: {
              name: staff.faculty,
            },
          },
        });
      }

      if (scope === CourseOfferingScope.PROGRAMME) {
        allowedCount = await this.prisma.programme.count({
          where: {
            id: { in: audienceIds },
            department: {
              faculty: {
                name: staff.faculty,
              },
            },
          },
        });
      }

      if (allowedCount !== audienceIds.length) {
        throw new ForbiddenException(
          'You can only manage offerings inside your assigned faculty',
        );
      }

      return;
    }

    if (staff.user.role === UserRole.DEPARTMENT_ADMIN) {
      if (!staff.department) {
        throw new ForbiddenException(
          'Department admin has no assigned department',
        );
      }

      if (scope === CourseOfferingScope.FACULTY) {
        throw new ForbiddenException(
          'Department admin cannot manage faculty-wide offerings',
        );
      }

      let allowedCount = 0;

      if (scope === CourseOfferingScope.DEPARTMENT) {
        allowedCount = await this.prisma.department.count({
          where: {
            id: { in: audienceIds },
            name: staff.department,
          },
        });
      }

      if (scope === CourseOfferingScope.PROGRAMME) {
        allowedCount = await this.prisma.programme.count({
          where: {
            id: { in: audienceIds },
            department: {
              name: staff.department,
            },
          },
        });
      }

      if (allowedCount !== audienceIds.length) {
        throw new ForbiddenException(
          'You can only manage offerings inside your assigned department',
        );
      }

      return;
    }

    throw new ForbiddenException('You cannot manage course offerings');
  }

  async findAll(userId: string) {
    const staff = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!staff) {
      throw new ForbiddenException('Staff profile not found');
    }

    let where: Prisma.CourseOfferingWhereInput = {};

    if (staff.user.role === UserRole.ADMIN) {
      where = {
        audiences: {
          some: {
            OR: [
              { faculty: { name: staff.faculty ?? undefined } },
              {
                department: {
                  faculty: {
                    name: staff.faculty ?? undefined,
                  },
                },
              },
              {
                programme: {
                  department: {
                    faculty: {
                      name: staff.faculty ?? undefined,
                    },
                  },
                },
              },
            ],
          },
        },
      };
    }

    if (staff.user.role === UserRole.DEPARTMENT_ADMIN) {
      where = {
        audiences: {
          some: {
            OR: [
              { department: { name: staff.department ?? undefined } },
              {
                programme: {
                  department: {
                    name: staff.department ?? undefined,
                  },
                },
              },
            ],
          },
        },
      };
    }

    return this.prisma.courseOffering.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: this.courseOfferingInclude(),
    });
  }

  async findOne(id: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id },
      include: this.courseOfferingInclude(),
    });
    if (!offering) {
      throw new NotFoundException('Course Offering not found');
    }
    return offering;
  }

  //Update course offering
  async update(userId: string, id: string, dto: UpdateCourseOfferingDto) {
    const existingOffering = await this.findOne(id);

    const nextScope = dto.scope ?? existingOffering.scope;

    const scopeChanged =
      dto.scope !== undefined && dto.scope !== existingOffering.scope;

    if (
      scopeChanged &&
      nextScope !== CourseOfferingScope.UNIVERSITY &&
      dto.audienceIds === undefined
    ) {
      throw new BadRequestException(
        'audienceIds must be supplied when changing offering scope',
      );
    }

    const existingAudienceIds = this.getAudienceIds(
      existingOffering.audiences,
      nextScope,
    );

    const nextAudienceIds =
      dto.audienceIds ?? (scopeChanged ? [] : existingAudienceIds);

    const nextCourseId = dto.courseId ?? existingOffering.courseId;
    const nextSemesterId =
      dto.academicSemesterId ?? existingOffering.academicSemesterId;

    await this.ensureCourseExists(nextCourseId);
    await this.ensureAcademicSemesterExists(nextSemesterId);
    await this.validateOfferingScope(nextScope, nextAudienceIds);
    await this.ensureStaffCanManageOfferingScope(
      userId,
      nextScope,
      nextAudienceIds,
    );

    if (dto.lecturerId) {
      await this.ensureLecturerExists(dto.lecturerId);
    }

    try {
      return await this.prisma.courseOffering.update({
        where: { id },
        data: {
          courseId: dto.courseId,
          academicSemesterId: dto.academicSemesterId,
          lecturerId: dto.lecturerId,
          scope: dto.scope,
          level: dto.level,
          registrationOpen: dto.registrationOpen,

          ...(scopeChanged || dto.audienceIds !== undefined
            ? {
                audiences: {
                  deleteMany: {},
                  create: this.buildAudienceCreateData(
                    nextScope,
                    nextAudienceIds,
                  ),
                },
              }
            : {}),
        },
        include: this.courseOfferingInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private getAudienceIds(
    audiences: {
      academicCategoryId: string | null;
      facultyId: string | null;
      departmentId: string | null;
      programmeId: string | null;
    }[],
    scope: CourseOfferingScope,
  ) {
    if (scope === CourseOfferingScope.ACADEMIC_CATEGORY) {
      return audiences.flatMap((audience) =>
        audience.academicCategoryId ? [audience.academicCategoryId] : [],
      );
    }

    if (scope === CourseOfferingScope.FACULTY) {
      return audiences.flatMap((audience) =>
        audience.facultyId ? [audience.facultyId] : [],
      );
    }

    if (scope === CourseOfferingScope.DEPARTMENT) {
      return audiences.flatMap((audience) =>
        audience.departmentId ? [audience.departmentId] : [],
      );
    }

    if (scope === CourseOfferingScope.PROGRAMME) {
      return audiences.flatMap((audience) =>
        audience.programmeId ? [audience.programmeId] : [],
      );
    }

    return [];
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.courseOffering.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private courseOfferingInclude() {
    return {
      course: true,
      academicSemester: {
        include: {
          academicSession: true,
        },
      },
      lecturer: true,
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
    };
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not Found');
    }
    return course;
  }

  private async ensureProgrammeExists(programmeId: string) {
    const programme = await this.prisma.programme.findUnique({
      where: { id: programmeId },
    });
    if (!programme) {
      throw new NotFoundException('Programme not Found');
    }
  }

  private async ensureAcademicSemesterExists(academicSemesterId: string) {
    const semester = await this.prisma.academicSemester.findUnique({
      where: { id: academicSemesterId },
    });

    if (!semester) {
      throw new NotFoundException('Academic semester not Found');
    }
    return semester;
  }

  private async ensureLecturerExists(lecturerId: string) {
    const lecturer = await this.prisma.staffProfile.findUnique({
      where: { id: lecturerId },
      include: {
        user: true,
      },
    });

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    if (lecturer.user.role !== UserRole.LECTURER) {
      throw new BadRequestException('Assigned staff must be a lecturer');
    }

    return lecturer;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'This course has already been offered for this programme and semester',
        );
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete this course offering because it has related records ',
        );
      }
    }
    throw error;
  }
}
