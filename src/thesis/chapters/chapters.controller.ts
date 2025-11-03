import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ThesisResponseService } from '../shared/thesis-response.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly response: ThesisResponseService) {}

  @Get('theoretical-framework')
  theoreticalFramework(): ApiResponse {
    return this.response.build(
      'chapters',
      { subpart: 'theoretical-framework' },
      'Theoretical framework / background',
    );
  }

  @Get('problem-analysis')
  problemAnalysis(): ApiResponse {
    return this.response.build(
      'chapters',
      { subpart: 'problem-analysis' },
      'Problem analysis / diagnosis',
    );
  }
}
