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
@ApiTags('Thesis - Chapters')
@Controller('thesis/:id/chapters')
export class ChaptersController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get('theoretical-framework')
  @ApiOperation({ summary: 'Obtener el marco teórico/antecedentes' })
  @ApiOkResponse({ description: 'Contenido del marco teórico' })
  async theoreticalFramework(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    // Parte combinada y granular
    const combined = await this.sections.get(user, id, 'theoreticalFramework');
    return this.response.build(
      'chapters',
      { id, part: combined },
      'Theoretical framework / background',
    );
  }

  @Get('problem-analysis')
  @ApiOperation({ summary: 'Obtener análisis del problema/diagnóstico' })
  @ApiOkResponse({ description: 'Contenido del análisis del problema' })
  async problemAnalysis(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'introduction.problemStatement',
    );
    return this.response.build(
      'chapters',
      { id, part },
      'Problem analysis / diagnosis',
    );
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Actualizar un capítulo por key' })
  @ApiOkResponse({ description: 'Capítulo actualizado' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: { title?: string; content?: string },
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.upsert(user, id, key, body);
    return this.response.build('chapters', { id, part }, 'Updated');
  }
}
