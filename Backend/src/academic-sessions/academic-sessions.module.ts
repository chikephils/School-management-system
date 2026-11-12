import { Module } from '@nestjs/common';
import { AcademicSessionsService } from './academic-sessions.service';
import { AcademicSessionsController } from './academic-sessions.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AcademicSessionsService],
  controllers: [AcademicSessionsController],
})
export class AcademicSessionsModule {}
