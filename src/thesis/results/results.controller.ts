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
@ApiTags('Thesis - Results')
@Controller('thesis/:id/results')
export class ResultsController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la sección de resultados' })
  @ApiOkResponse({ description: 'Resultados de la tesis' })
  async get(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'results');
    return this.response.build('results', { id, part }, 'Results');
  }

  @Get('discussion')
  @ApiOperation({ summary: 'Obtener la sección de discusión' })
  @ApiOkResponse({ description: 'Discusión de resultados' })
  async discussion(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'discussion');
    return this.response.build('results', { id, part }, 'Discussion');
  }

  @Patch(':key')
  @ApiOperation({
    summary: 'Actualizar una parte dentro de resultados (results o discussion)',
  })
  @ApiOkResponse({ description: 'Parte de resultados actualizada' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: { title?: string; content?: string },
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.upsert(user, id, key, body);
    return this.response.build('results', { id, part }, 'Updated');
  }
}
