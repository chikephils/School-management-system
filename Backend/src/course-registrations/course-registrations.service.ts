import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CourseOfferingScope,
  CourseRegistrationType,
  Prisma,
  RegistrationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseRegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerCourse(userId: string, courseOfferringId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
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

    const courseOffering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferringId },
      include: {
        course: true,
        academicSemester: true,
        audiences: {
          select: {
            academicCategoryId: true,
            facultyId: true,
            departmentId: true,
            programmeId: true,
          },
        },
      },
    });

    if (!courseOffering) {
      throw new NotFoundException('Course Offering not found');
    }

    if (!student.programmeRecord) {
      throw new BadRequestException('Student programme record not found');
    }

    this.ensureStudentCanRegisterOffering(student, courseOffering);

    const submittedRegistration =
      await this.prisma.courseRegistration.findFirst({
        where: {
          studentProfileId: student.id,
          status: RegistrationStatus.SUBMITTED,
          courseOffering: {
            academicSemesterId: courseOffering.academicSemesterId,
          },
        },
      });

    if (submittedRegistration) {
      throw new BadRequestException(
        'You cannot add courses after submitting registration for this semester',
      );
    }

    if (!courseOffering.registrationOpen) {
      throw new BadRequestException('Registration is closed for this course');
    }
    if (!courseOffering.academicSemester.registrationOpen) {
      throw new BadRequestException('Semester Registration is closed');
    }
    if (courseOffering.level > student.level) {
      throw new BadRequestException('You cannot register higher level courses');
    }

    const registrationType = await this.determineRegistrationType(
      student.id,
      student.level,
      courseOffering.courseId,
      courseOffering.level,
    );

    try {
      return await this.prisma.courseRegistration.create({
        data: {
          studentProfileId: student.id,
          courseOfferingId: courseOffering.id,
          type: registrationType,
        },
        include: this.courseRegistrationInclude(),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private ensureStudentCanRegisterOffering(
    student: {
      programmeRecord: {
        id: string;
        department: {
          id: string;
          faculty: {
            id: string;
            academicCategoryId: string;
          };
        };
      } | null;
    },
    courseOffering: {
      scope: CourseOfferingScope;
      audiences: {
        academicCategoryId: string | null;
        facultyId: string | null;
        departmentId: string | null;
        programmeId: string | null;
      }[];
    },
  ) {
    if (!student.programmeRecord) {
      throw new BadRequestException('Student programme record not found');
    }

    if (courseOffering.scope === CourseOfferingScope.UNIVERSITY) {
      return;
    }

    const programmeId = student.programmeRecord.id;
    const departmentId = student.programmeRecord.department.id;
    const facultyId = student.programmeRecord.department.faculty.id;
    const academicCategoryId =
      student.programmeRecord.department.faculty.academicCategoryId;

    const isEligible = courseOffering.audiences.some((audience) => {
      if (courseOffering.scope === CourseOfferingScope.ACADEMIC_CATEGORY) {
        return audience.academicCategoryId === academicCategoryId;
      }

      if (courseOffering.scope === CourseOfferingScope.FACULTY) {
        return audience.facultyId === facultyId;
      }

      if (courseOffering.scope === CourseOfferingScope.DEPARTMENT) {
        return audience.departmentId === departmentId;
      }

      return audience.programmeId === programmeId;
    });

    if (!isEligible) {
      throw new ForbiddenException(
        'You are not eligible to register this course offering',
      );
    }
  }

  async findMyRegistrations(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const currentSemester = await this.prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
      include: {
        academicSession: true,
      },
    });

    if (!currentSemester) {
      throw new NotFoundException('Current semester not found');
    }

    const registrations = await this.prisma.courseRegistration.findMany({
      where: {
        studentProfileId: student.id,
        courseOffering: {
          academicSemesterId: currentSemester.id,
        },
      },
      orderBy: {
        courseOffering: {
          course: {
            code: 'asc',
          },
        },
      },
      include: this.courseRegistrationInclude(),
    });

    const courses = registrations.map((registration) => {
      const course = registration.courseOffering.course;
      const lecturer = registration.courseOffering.lecturer;

      const gpaCreditUnit =
        registration.type === CourseRegistrationType.CARRYOVER
          ? course.creditUnit * 2
          : course.creditUnit;

      return {
        registrationId: registration.id,
        courseOfferingId: registration.courseOfferingId,

        courseCode: course.code,
        courseTitle: course.title,
        creditUnit: course.creditUnit,
        level: course.level,
        gpaCreditUnit,

        registrationType: registration.type,
        status: registration.status,
        registeredAt: registration.registeredAt,
        submittedAt: registration.submittedAt,

        caScore: registration.caScore,
        examScore: registration.examScore,
        totalScore: registration.totalScore,
        grade: registration.grade,
        gradePoint: registration.gradePoint,

        scope: registration.courseOffering.scope,

        audiences: registration.courseOffering.audiences.map((audience) => ({
          id: audience.id,
          academicCategory: audience.academicCategory,
          faculty: audience.faculty,
          department: audience.department,
          programme: audience.programme,
        })),

        lecturer: lecturer
          ? {
              id: lecturer.id,
              title: lecturer.title,
              firstName: lecturer.firstName,
              lastName: lecturer.lastName,
            }
          : null,
      };
    });

    const totalCreditUnits = courses.reduce(
      (sum, course) => sum + course.creditUnit,
      0,
    );

    const totalGpaUnits = courses.reduce(
      (sum, course) => sum + course.gpaCreditUnit,
      0,
    );

    const hasSubmittedRegistration = courses.some(
      (course) => course.status === RegistrationStatus.SUBMITTED,
    );

    const hasDraftRegistration = courses.some(
      (course) => course.status === RegistrationStatus.DRAFT,
    );

    const registrationStatus = hasSubmittedRegistration
      ? RegistrationStatus.SUBMITTED
      : hasDraftRegistration
        ? RegistrationStatus.DRAFT
        : null;

    return {
      academicSemester: {
        id: currentSemester.id,
        academicSession: {
          id: currentSemester.academicSession.id,
          name: currentSemester.academicSession.name,
        },
      },
      registrationStatus,
      hasSubmittedRegistration,
      hasDraftRegistration,
      canRegister: !hasSubmittedRegistration,
      minimumUnits: 18,
      maximumUnits: 24,
      totalCreditUnits,
      totalGpaUnits,
      totalCourses: courses.length,
      courses,
    };
  }
  private async determineRegistrationType(
    studentProfileId: string,
    studentLevel: number,
    courseId: string,
    offeringLevel: number,
  ) {
    if (offeringLevel === studentLevel) {
      return CourseRegistrationType.NORMAL;
    }

    const previousRegistration = await this.prisma.courseRegistration.findFirst(
      {
        where: {
          studentProfileId,
          courseOffering: {
            courseId,
          },
        },
      },
    );
    return previousRegistration
      ? CourseRegistrationType.CARRYOVER
      : CourseRegistrationType.SPILLOVER;
  }

  private courseRegistrationInclude() {
    return {
      courseOffering: {
        include: {
          course: true,
          audiences: {
            include: {
              academicCategory: true,
              faculty: true,
              department: true,
              programme: true,
            },
          },
          academicSemester: {
            include: {
              academicSession: true,
            },
          },
          lecturer: true,
        },
      },
    };
  }

  async findAvailableCourses(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
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

    if (!student.programmeRecord) {
      throw new BadRequestException('Student programme record not found');
    }

    const studentProgrammeId = student.programmeRecord.id;
    const studentDepartmentId = student.programmeRecord.department.id;
    const studentFacultyId = student.programmeRecord.department.faculty.id;
    const studentAcademicCategoryId =
      student.programmeRecord.department.faculty.academicCategoryId;

    return this.prisma.courseOffering.findMany({
      where: {
        registrationOpen: true,
        academicSemester: {
          registrationOpen: true,
          isCurrent: true,
        },
        level: {
          lte: student.level,
        },
        OR: [
          {
            scope: CourseOfferingScope.UNIVERSITY,
          },
          {
            scope: CourseOfferingScope.ACADEMIC_CATEGORY,
            audiences: {
              some: {
                academicCategoryId: studentAcademicCategoryId,
              },
            },
          },
          {
            scope: CourseOfferingScope.FACULTY,
            audiences: {
              some: {
                facultyId: studentFacultyId,
              },
            },
          },
          {
            scope: CourseOfferingScope.DEPARTMENT,
            audiences: {
              some: {
                departmentId: studentDepartmentId,
              },
            },
          },
          {
            scope: CourseOfferingScope.PROGRAMME,
            audiences: {
              some: {
                programmeId: studentProgrammeId,
              },
            },
          },
        ],
      },
      orderBy: [
        {
          level: 'asc',
        },
        {
          course: {
            code: 'asc',
          },
        },
      ],
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
        lecturer: true,
        registrations: {
          where: {
            studentProfileId: student.id,
          },
        },
      },
    });
  }

  async submitMyRegistration(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const currentSemester = await this.prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (!currentSemester) {
      throw new NotFoundException('Current Academic semseter not found');
    }

    const registrations = await this.prisma.courseRegistration.findMany({
      where: {
        studentProfileId: student.id,
        status: RegistrationStatus.DRAFT,
        courseOffering: {
          academicSemesterId: currentSemester.id,
        },
      },
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
      },
    });

    if (registrations.length === 0) {
      throw new NotFoundException('No Draft courses to submit');
    }

    const totalUnits = registrations.reduce((sum, registration) => {
      return sum + registration.courseOffering.course.creditUnit;
    }, 0);

    if (totalUnits < 18) {
      throw new BadRequestException(
        `Minimum course load is 18 units. Current course load is ${totalUnits}`,
      );
    }

    if (totalUnits > 24) {
      throw new BadRequestException(
        `Minimum course load is 18 units. Current course load is ${totalUnits}`,
      );
    }

    await this.prisma.courseRegistration.updateMany({
      where: {
        studentProfileId: student.id,
        status: RegistrationStatus.DRAFT,
        courseOffering: {
          academicSemesterId: currentSemester.id,
        },
      },
      data: {
        status: RegistrationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    return {
      message: 'Course registration submitted successfully',
      totalUnits,
    };
  }

  async removeMyDraftRegistration(userId: string, registrationId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const registration = await this.prisma.courseRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Course registration not found');
    }

    if (registration.studentProfileId !== student.id) {
      throw new BadRequestException(
        'This course registration does not belong to you',
      );
    }

    if (registration.status !== RegistrationStatus.DRAFT) {
      throw new BadRequestException(
        'Submitted course registrations cannot be removed ',
      );
    }

    await this.prisma.courseRegistration.delete({
      where: { id: registration.id },
    });

    return {
      message: 'Course registration removed successfully',
    };
  }

  async getMyDraftSummary(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const currentSemester = await this.prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (!currentSemester) {
      throw new NotFoundException('Current semester not found');
    }

    const registrations = await this.prisma.courseRegistration.findMany({
      where: {
        studentProfileId: student.id,
        status: RegistrationStatus.DRAFT,
        courseOffering: {
          academicSemesterId: currentSemester.id,
        },
      },
      orderBy: {
        courseOffering: {
          course: {
            code: 'asc',
          },
        },
      },
      include: this.courseRegistrationInclude(),
    });

    const courses = registrations.map((registration) => {
      const course = registration.courseOffering.course;

      const gpaCreditUnit =
        registration.type === CourseRegistrationType.CARRYOVER
          ? course.creditUnit * 2
          : course.creditUnit;

      return {
        registrationId: registration.id,
        courseOfferingId: registration.courseOfferingId,
        courseCode: course.code,
        courseTitle: course.title,
        creditUnit: course.creditUnit,
        gpaCreditUnit,
        registrationType: registration.type,
        status: registration.status,
      };
    });

    const registeredUnits = courses.reduce(
      (sum, course) => sum + course.creditUnit,
      0,
    );

    const gpaUnits = courses.reduce(
      (sum, course) => sum + course.gpaCreditUnit,
      0,
    );

    const canSubmit = registeredUnits >= 18 && registeredUnits <= 24;

    return {
      academicSemesterId: currentSemester.id,
      minimumUnits: 18,
      maximumUnits: 24,
      registeredUnits,
      gpaUnits,
      canSubmit,
      message: canSubmit
        ? 'Course registration can be submitted'
        : 'Course load must be between 18 and 24 units',
      courses,
    };
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already registered this course');
      }
    }
    throw error;
  }
}
