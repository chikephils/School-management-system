import { Module } from '@nestjs/common';
import { ProgrammesService } from './programmes.service';
import { ProgrammesController } from './programmes.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProgrammesService],
  controllers: [ProgrammesController],
})
export class ProgrammesModule {}
