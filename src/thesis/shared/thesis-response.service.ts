import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ok } from '../../common/responses/api-response';

@Injectable()
export class ThesisResponseService {
  build(
    section: string,
    details?: Record<string, unknown>,
    message = 'OK',
  ): ApiResponse<unknown> {
    return ok({ section, ...details }, message);
  }
}
