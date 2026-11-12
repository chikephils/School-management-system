import { Module } from '@nestjs/common';
import { CourseRegistrationsService } from './course-registrations.service';
import { CourseRegistrationsController } from './course-registrations.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CourseRegistrationsService],
  controllers: [CourseRegistrationsController],
})
export class CourseRegistrationsModule {}
