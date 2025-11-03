import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ThesisResponseService } from '../shared/thesis-response.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('references')
export class ReferencesController {
  constructor(private readonly response: ThesisResponseService) {}

  @Get()
  get(): ApiResponse {
    return this.response.build('references', undefined, 'References');
  }
}
