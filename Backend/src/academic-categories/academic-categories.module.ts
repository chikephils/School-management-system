import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AcademicCategoriesController } from './academic-categories.controller';
import { AcademicCategoriesService } from './academic-categories.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AcademicCategoriesController],
  providers: [AcademicCategoriesService],
})
export class AcademicCategoriesModule {}
