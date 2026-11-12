import { Module } from '@nestjs/common';
import { CourseOfferingsService } from './course-offerings.service';
import { CourseOfferingsController } from './course-offerings.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CourseOfferingsService],
  controllers: [CourseOfferingsController],
})
export class CourseOfferingsModule {}
