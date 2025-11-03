import { Module } from '@nestjs/common';
import { ResultsController } from './results.controller.js';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [ResultsController],
  providers: [ApiKeyGuard],
})
export class ResultsModule {}
