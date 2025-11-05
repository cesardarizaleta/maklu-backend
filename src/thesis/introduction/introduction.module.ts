import { Module } from '@nestjs/common';
import { IntroductionController } from './introduction.controller';
import { ThesisSharedModule } from '../shared/thesis-shared.module';
import { AuthModule } from '../../auth/auth.module';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@Module({
  imports: [AuthModule, ThesisSharedModule],
  controllers: [IntroductionController],
  providers: [ApiKeyGuard],
})
export class IntroductionModule {}
