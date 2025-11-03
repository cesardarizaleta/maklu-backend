import { Module } from '@nestjs/common';
import { AppendicesController } from './appendices.controller.js';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [AppendicesController],
  providers: [ApiKeyGuard],
})
export class AppendicesModule {}
