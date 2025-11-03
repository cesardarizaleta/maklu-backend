import { Module } from '@nestjs/common';
import { ChaptersController } from './chapters.controller.js';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [ChaptersController],
  providers: [ApiKeyGuard],
})
export class ChaptersModule {}
