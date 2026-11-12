import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerStudent(dto: RegisterStudentDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createStudent(dto, hashedPassword);

    return this.buildAuthResponse(user);
  }

  async registerStaff(dto: RegisterStaffDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createStaff(dto, hashedPassword);

    return {
      message: 'Staff account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        staffProfile: user.staffProfile,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    studentProfile?: unknown;
    staffProfile?: unknown;
  }) {
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtExpiresIn =
      this.configService.get<'1d' | '12h' | '7d'>('JWT_EXPIRES_IN') ?? '1d';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: jwtExpiresIn,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentProfile: user.studentProfile ?? null,
        staffProfile: user.staffProfile ?? null,
      },
    };
  }
}
