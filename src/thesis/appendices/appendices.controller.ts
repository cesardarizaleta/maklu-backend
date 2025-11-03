import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ThesisResponseService } from '../shared/thesis-response.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('appendices')
export class AppendicesController {
  constructor(private readonly response: ThesisResponseService) {}

  @Get()
  get(): ApiResponse {
    return this.response.build('appendices', undefined, 'Appendices');
  }
}
