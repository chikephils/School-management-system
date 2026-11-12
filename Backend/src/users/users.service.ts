import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterStaffDto } from '../auth/dto/register-staff.dto';
import { RegisterStudentDto } from '../auth/dto/register-student.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        staffProfile: true,
      },
    });
  }

  async createStudent(dto: RegisterStudentDto, hashedPassword: string) {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email Already in use');
    }

    const programme = await this.prisma.programme.findUnique({
      where: { id: dto.programmeId },
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

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            matricNumber: dto.matricNumber,
            firstName: dto.firstName,
            lastName: dto.lastName,
            gender: dto.gender,
            dateOfBirth: new Date(dto.dateOfBirth),
            phoneNumber: dto.phoneNumber,
            profileImageUrl: dto.profileImageUrl,
            programmeId: dto.programmeId,
            faculty: programme.department.faculty.name,
            department: programme.department.name,
            programme: programme.name,
            admissionLevel: dto.level,
            level: dto.level,
            admissionYear: dto.admissionYear,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });
  }

  async createStaff(dto: RegisterStaffDto, hashedPassword: string) {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email is already In use');
    }

    if (dto.role === UserRole.STUDENT) {
      throw new ConflictException('Staff account cannot use STUDENT role');
    }

    if (dto.role === UserRole.ADMIN && !dto.faculty) {
      throw new ConflictException('Faculty is required for faculty admins');
    }

    const departmentScopedRoles: UserRole[] = [
      UserRole.DEPARTMENT_ADMIN,
      UserRole.LECTURER,
    ];

    if (
      departmentScopedRoles.includes(dto.role) &&
      (!dto.faculty || !dto.department)
    ) {
      throw new ConflictException(
        'Faculty and department are required for this staff role',
      );
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        staffProfile: {
          create: {
            staffNumber: dto.staffNumber,
            email: dto.email,
            title: dto.title,
            firstName: dto.firstName,
            lastName: dto.lastName,
            otherName: dto.otherName,
            phoneNumber: dto.phoneNumber,
            profileImageUrl: dto.profileImageUrl,
            faculty: dto.faculty,
            department: dto.department,
          },
        },
      },
      include: {
        staffProfile: true,
      },
    });
  }
}
