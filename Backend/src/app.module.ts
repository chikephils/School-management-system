import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FacultiesModule } from './faculties/faculties.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProgrammesModule } from './programmes/programmes.module';
import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module';
import { CoursesModule } from './courses/courses.module';
import { CourseOfferingsModule } from './course-offerings/course-offerings.module';
import { CourseRegistrationsModule } from './course-registrations/course-registrations.module';
import { ScoresModule } from './scores/scores.module';
import { ResultsModule } from './results/results.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { AcademicCategoriesModule } from './academic-categories/academic-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    FacultiesModule,
    DepartmentsModule,
    ProgrammesModule,
    AcademicSessionsModule,
    CoursesModule,
    CourseOfferingsModule,
    CourseRegistrationsModule,
    ScoresModule,
    ResultsModule,
    StudentsModule,
    StaffModule,
    AcademicCategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
