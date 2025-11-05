import { Module } from '@nestjs/common';
import { ReferencesController } from './references.controller';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [ReferencesController],
  providers: [ApiKeyGuard],
})
export class ReferencesModule {}
