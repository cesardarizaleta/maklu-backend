import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ThesisResponseService } from '../shared/thesis-response.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('methodology')
export class MethodologyController {
  constructor(private readonly response: ThesisResponseService) {}

  @Get()
  get(): ApiResponse {
    return this.response.build('methodology', undefined, 'Methodology');
  }

  @Get('methods')
  methods(): ApiResponse {
    return this.response.build(
      'methodology',
      { subpart: 'methods' },
      'Methods',
    );
  }

  @Get('techniques')
  techniques(): ApiResponse {
    return this.response.build(
      'methodology',
      { subpart: 'techniques' },
      'Techniques',
    );
  }

  @Get('procedures')
  procedures(): ApiResponse {
    return this.response.build(
      'methodology',
      { subpart: 'procedures' },
      'Procedures',
    );
  }

  @Get('work-plan')
  workPlan(): ApiResponse {
    return this.response.build(
      'methodology',
      { subpart: 'work-plan' },
      'Work plan',
    );
  }

  @Get('timelines')
  timelines(): ApiResponse {
    return this.response.build(
      'methodology',
      { subpart: 'timelines' },
      'Timelines',
    );
  }
}
