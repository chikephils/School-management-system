import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseGrade, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateScoreDto } from './dto/update-score.dto';

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  async updateScore(
    userId: string,
    registrationId: string,
    dto: UpdateScoreDto,
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

    const registration = await this.prisma.courseRegistration.findUnique({
      where: { id: registrationId },
      include: {
        courseOffering: {
          include: {
            lecturer: true,
            course: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Course registration not found');
    }

    const canUpdate =
      staff.user.role === UserRole.SUPER_ADMIN ||
      staff.user.role === UserRole.ADMIN ||
      registration.courseOffering.lecturerId === staff.id;

    if (!canUpdate) {
      throw new ForbiddenException(
        'You can only update scores for courses assigned to you',
      );
    }

    const totalScore = dto.caScore + dto.examScore;

    if (totalScore > 100) {
      throw new BadRequestException('Total score cannot exceed 100');
    }

    const gradeResult = this.calculateGrade(totalScore);

    return this.prisma.courseRegistration.update({
      where: { id: registration.id },
      data: {
        caScore: dto.caScore,
        examScore: dto.examScore,
        totalScore,
        grade: gradeResult.grade,
        gradePoint: gradeResult.gradePoint,
        scoreUpdatedAt: new Date(),
        scoreUpdatedById: staff.id,
      },
      include: {
        studentProfile: true,
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
        scoreUpdatedBy: true,
      },
    });
  }

  async findStudentsForMyCourseOffering(
    userId: string,
    courseOfferingId: string,
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

    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
    });

    if (!offering) {
      throw new NotFoundException('Course offering not found');
    }

    const canView =
      staff.user.role === UserRole.SUPER_ADMIN ||
      staff.user.role === UserRole.ADMIN ||
      offering.lecturerId === staff.id;

    if (!canView) {
      throw new ForbiddenException(
        'You can only view students for courses assigned to you',
      );
    }

    return this.prisma.courseRegistration.findMany({
      where: {
        courseOfferingId,
      },
      orderBy: {
        studentProfile: {
          lastName: 'asc',
        },
      },
      include: {
        studentProfile: true,
        courseOffering: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  private calculateGrade(totalScore: number) {
    if (totalScore >= 70) {
      return { grade: CourseGrade.A, gradePoint: 5 };
    }

    if (totalScore >= 60) {
      return { grade: CourseGrade.B, gradePoint: 4 };
    }

    if (totalScore >= 50) {
      return { grade: CourseGrade.C, gradePoint: 3 };
    }

    if (totalScore >= 45) {
      return { grade: CourseGrade.D, gradePoint: 2 };
    }

    if (totalScore >= 40) {
      return { grade: CourseGrade.E, gradePoint: 1 };
    }

    return { grade: CourseGrade.F, gradePoint: 0 };
  }
}
