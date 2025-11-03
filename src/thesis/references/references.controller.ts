import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ThesisResponseService } from '../shared/thesis-response.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { ThesisSectionsService } from '../shared/thesis-sections.service';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../auth/guards/api-key.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(ApiKeyGuard)
@ApiBearerAuth()
@ApiTags('Thesis - References')
@Controller('thesis/:id/references')
export class ReferencesController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la sección de referencias' })
  @ApiOkResponse({ description: 'Referencias bibliográficas' })
  async get(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'references');
    return this.response.build('references', { id, part }, 'References');
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar la sección de referencias' })
  @ApiOkResponse({ description: 'Referencias actualizadas' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.upsert(user, id, 'references', body);
    return this.response.build('references', { id, part }, 'Updated');
  }
}
