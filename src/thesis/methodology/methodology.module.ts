import { Module } from '@nestjs/common';
import { MethodologyController } from './methodology.controller';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [MethodologyController],
  providers: [ApiKeyGuard],
})
export class MethodologyModule {}
