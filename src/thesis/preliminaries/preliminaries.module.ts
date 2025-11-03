import { Module } from '@nestjs/common';
import { PreliminariesController } from './preliminaries.controller.js';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [PreliminariesController],
  providers: [ApiKeyGuard],
})
export class PreliminariesModule {}
