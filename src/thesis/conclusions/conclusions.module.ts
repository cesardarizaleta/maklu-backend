import { Module } from '@nestjs/common';
import { ConclusionsController } from './conclusions.controller.js';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [ConclusionsController],
  providers: [ApiKeyGuard],
})
export class ConclusionsModule {}
