import { Module } from '@nestjs/common';
import { ThesisResponseService } from './thesis-response.service';

@Module({
  providers: [ThesisResponseService],
  exports: [ThesisResponseService],
})
export class ThesisSharedModule {}
