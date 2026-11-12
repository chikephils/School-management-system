import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseRegistrationType } from '@prisma/client';
import { UserRole } from '@prisma/client';

type RegisteredCourseResult = {
  registrationId: string;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  gpaCreditUnit: number;
  registrationType: string;
  caScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  grade: string | null;
  gradePoint: number | null;
  qualityPoint: number | null;
};
@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  //Get semester result
  async getMySemesterResult(userId: string, academicSemesterId?: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.getSemesterResultForStudentProfile(
      student.id,
      academicSemesterId,
    );
  }

  //Get cgpa
  async getMyCgpa(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.getCgpaForStudentProfile(student.id);
  }

  //Get Semester
  private async getCurrentAcademicSemesterId() {
    const semseter = await this.prisma.academicSemester.findFirst({
      where: { isCurrent: true },
    });

    if (!semseter) {
      throw new NotFoundException('Current academic semester not found');
    }

    return semseter.id;
  }

  //Ensure who can view result
  private async ensureManagerCanViewStudent(
    userId: string,
    studentProfileId: string,
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

    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    if (staff.user.role === UserRole.SUPER_ADMIN) {
      return student;
    }

    if (
      staff.user.role === UserRole.ADMIN &&
      student.faculty !== staff.faculty
    ) {
      throw new ForbiddenException(
        'You can only view results for students in your faculty',
      );
    }

    if (
      staff.user.role === UserRole.DEPARTMENT_ADMIN &&
      student.department !== staff.department
    ) {
      throw new ForbiddenException(
        'You can only view results for students in your department',
      );
    }

    return student;
  }

  //Get Semester results for Managers
  async getStudentSemesterResultForManager(
    managerUserId: string,
    studentProfileId: string,
    academicSemesterId?: string,
  ) {
    const student = await this.ensureManagerCanViewStudent(
      managerUserId,
      studentProfileId,
    );

    return this.getSemesterResultForStudentProfile(
      student.id,
      academicSemesterId,
    );
  }

  //Get Cgpa for Managers
  async getStudentCgpaForManager(
    managerUserId: string,
    studentProfileId: string,
  ) {
    const student = await this.ensureManagerCanViewStudent(
      managerUserId,
      studentProfileId,
    );

    return this.getCgpaForStudentProfile(student.id);
  }

  //Get semseter results for Student
  private async getSemesterResultForStudentProfile(
    studentProfileId: string,
    academicSemesterId?: string,
  ) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const semesterId =
      academicSemesterId ?? (await this.getCurrentAcademicSemesterId());

    const registrations = await this.prisma.courseRegistration.findMany({
      where: {
        studentProfileId: student.id,
        courseOffering: {
          academicSemesterId: semesterId,
        },
      },
      orderBy: {
        courseOffering: {
          course: {
            code: 'asc',
          },
        },
      },
      include: {
        courseOffering: {
          include: {
            course: true,
            academicSemester: {
              include: {
                academicSession: true,
              },
            },
          },
        },
      },
    });

    const courses: RegisteredCourseResult[] = registrations.map(
      (registration) => {
        const course = registration.courseOffering.course;

        const gpaCreditUnit =
          registration.type === CourseRegistrationType.CARRYOVER
            ? course.creditUnit * 2
            : course.creditUnit;

        const qualityPoint =
          registration.gradePoint === null
            ? null
            : registration.gradePoint * course.creditUnit;

        return {
          registrationId: registration.id,
          courseCode: course.code,
          courseTitle: course.title,
          creditUnit: course.creditUnit,
          gpaCreditUnit,
          registrationType: registration.type,
          caScore: registration.caScore,
          examScore: registration.examScore,
          totalScore: registration.totalScore,
          grade: registration.grade,
          gradePoint: registration.gradePoint,
          qualityPoint,
        };
      },
    );

    const totalRegisteredUnits = courses.reduce(
      (sum, course) => sum + course.creditUnit,
      0,
    );

    const completedCourses = courses.filter(
      (course) => course.gradePoint !== null,
    );

    const totalQualityPoints = completedCourses.reduce(
      (sum, course) => sum + (course.qualityPoint ?? 0),
      0,
    );

    const totalGpaUnits = completedCourses.reduce(
      (sum, course) => sum + course.gpaCreditUnit,
      0,
    );

    const gpa =
      totalGpaUnits === 0
        ? null
        : Number((totalQualityPoints / totalGpaUnits).toFixed(2));

    return {
      student: {
        id: student.id,
        matricNumber: student.matricNumber,
        firstName: student.firstName,
        otherName: student.otherName,
        lastName: student.lastName,
        level: student.level,
        programme: student.programme,
      },
      academicSemesterId: semesterId,
      totalRegisteredUnits,
      totalGpaUnits,
      totalQualityPoints,
      gpa,
      courses,
    };
  }

  //Get Cgpa for student
  private async getCgpaForStudentProfile(studentProfileId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const registrations = await this.prisma.courseRegistration.findMany({
      where: {
        studentProfileId: student.id,
        gradePoint: {
          not: null,
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

    const totalGpaUnits = registrations.reduce((sum, registration) => {
      const creditUnit = registration.courseOffering.course.creditUnit;

      const gpaCreditUnit =
        registration.type === CourseRegistrationType.CARRYOVER
          ? creditUnit * 2
          : creditUnit;

      return sum + gpaCreditUnit;
    }, 0);

    const totalQualityPoints = registrations.reduce((sum, registration) => {
      const creditUnit = registration.courseOffering.course.creditUnit;
      const gradePoint = registration.gradePoint ?? 0;

      return sum + creditUnit * gradePoint;
    }, 0);

    const cgpa =
      totalGpaUnits === 0
        ? null
        : Number((totalQualityPoints / totalGpaUnits).toFixed(2));

    return {
      student: {
        id: student.id,
        matricNumber: student.matricNumber,
        firstName: student.firstName,
        otherName: student.otherName,
        lastName: student.lastName,
        level: student.level,
        programme: student.programme,
      },
      totalGpaUnits,
      totalQualityPoints,
      cgpa,
    };
  }
}
