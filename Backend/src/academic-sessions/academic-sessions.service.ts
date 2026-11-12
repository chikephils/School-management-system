import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
import { CreateAcademicSemesterDto } from './dto/create-academic-semester.dto';
import { UpdateAcademicSemesterDto } from './dto/update-academic-semester';

@Injectable()
@Injectable()
export class AcademicSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(dto: CreateAcademicSessionDto) {
    try {
      const session = await this.prisma.academicSession.create({
        data: {
          name: dto.name.trim(),
          isCurrent: dto.isCurrent ?? false,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
          endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        },
      });

      if (session.isCurrent) {
        await this.prisma.academicSession.updateMany({
          where: {
            id: {
              not: session.id,
            },
          },
          data: {
            isCurrent: false,
          },
        });
        await this.promoteStudentsForSession(session.id);
      }

      return session;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async promoteStudentsForSession(sessionId: string) {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Academic session not found');
    }

    const students = await this.prisma.studentProfile.findMany();

    for (const student of students) {
      const newLevel = this.calculateStudentLevel(
        student.admissionLevel,
        student.admissionYear,
        session.name,
      );

      await this.prisma.studentProfile.update({
        where: { id: student.id },
        data: {
          level: newLevel,
        },
      });
    }
  }

  private calculateStudentLevel(
    admissionLevel: number,
    admissionYear: number,
    currentSessionName: string,
  ): number {
    const currentSessionStartYear = Number(currentSessionName.slice(0, 4));

    if (Number.isNaN(currentSessionStartYear)) {
      return admissionLevel;
    }

    const completedSessions = Math.max(
      0,
      currentSessionStartYear - admissionYear,
    );

    return admissionLevel + completedSessions * 100;
  }

  async findAllSessions() {
    return this.prisma.academicSession.findMany({
      orderBy: {
        name: 'desc',
      },
      include: {
        semesters: true,
      },
    });
  }

  async findOneSession(id: string) {
    const session = await this.prisma.academicSession.findUnique({
      where: { id },
      include: {
        semesters: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Academic session not found');
    }
    return session;
  }

  async updateSession(id: string, dto: UpdateAcademicSessionDto) {
    await this.findOneSession(id);

    try {
      const updatedSession = await this.prisma.academicSession.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          isCurrent: dto.isCurrent,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
          endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        },
        include: {
          semesters: true,
        },
      });

      if (updatedSession.isCurrent) {
        await this.prisma.academicSession.updateMany({
          where: {
            id: {
              not: updatedSession.id,
            },
          },
          data: {
            isCurrent: false,
          },
        });

        await this.promoteStudentsForSession(updatedSession.id);
      }

      return updatedSession;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async removeSession(id: string) {
    await this.findOneSession(id);

    try {
      return await this.prisma.academicSession.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async createSemester(dto: CreateAcademicSemesterDto) {
    await this.findOneSession(dto.academicSessionId);

    try {
      const semester = await this.prisma.academicSemester.create({
        data: {
          academicSessionId: dto.academicSessionId,
          type: dto.type,
          isCurrent: dto.isCurrent ?? false,
          registrationOpen: dto.registrationOpen ?? false,
        },
        include: {
          academicSession: true,
        },
      });

      if (semester.isCurrent) {
        await this.prisma.academicSemester.updateMany({
          where: {
            id: {
              not: semester.id,
            },
          },
          data: {
            isCurrent: false,
          },
        });
      }
      return semester;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOneSemester(id: string) {
    const semester = await this.prisma.academicSemester.findUnique({
      where: { id },
      include: {
        academicSession: true,
      },
    });

    if (!semester) {
      throw new NotFoundException('Academic semester not found');
    }

    return semester;
  }

  async updateSemester(id: string, dto: UpdateAcademicSemesterDto) {
    await this.findOneSemester(id);

    if (dto.academicSessionId) {
      await this.findOneSession(dto.academicSessionId);
    }

    try {
      const semester = await this.prisma.academicSemester.update({
        where: { id },
        data: {
          ...(dto.academicSessionId !== undefined && {
            academicSessionId: dto.academicSessionId,
          }),

          ...(dto.type !== undefined && {
            type: dto.type,
          }),

          ...(dto.isCurrent !== undefined && {
            isCurrent: dto.isCurrent,
          }),

          ...(dto.registrationOpen !== undefined && {
            registrationOpen: dto.registrationOpen,
          }),
        },
        include: {
          academicSession: true,
        },
      });

      if (semester.isCurrent) {
        await this.prisma.academicSemester.updateMany({
          where: {
            id: {
              not: semester.id,
            },
          },
          data: {
            isCurrent: false,
          },
        });
      }

      return semester;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAllSemesters() {
    return this.prisma.academicSemester.findMany({
      orderBy: [
        {
          academicSession: {
            name: 'desc',
          },
        },
        {
          type: 'asc',
        },
      ],
      include: {
        academicSession: true,
      },
    });
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Academic record already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot delete this record because it has related records',
        );
      }
    }
    throw error;
  }
}
