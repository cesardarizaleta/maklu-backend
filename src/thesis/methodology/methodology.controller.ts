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
@ApiTags('Thesis - Methodology')
@Controller('thesis/:id/methodology')
export class MethodologyController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar partes disponibles de la metodología' })
  @ApiOkResponse({ description: 'Listado de keys de metodología' })
  list(@Param('id') id: string): ApiResponse {
    const items = [
      'methodology',
      'methodology.design',
      'methodology.populationSample',
      'methodology.sampling',
      'methodology.operationalization',
      'methodology.instruments',
      'methodology.validityReliability',
      'methodology.procedure',
      'methodology.ethics',
      'methodology.analysisPlan',
      'methodology.timeline',
    ];
    return this.response.build('methodology', { id, items }, 'Methodology');
  }

  @Get('methods')
  @ApiOperation({ summary: 'Obtener métodos/diseño de investigación' })
  @ApiOkResponse({ description: 'Métodos / Diseño' })
  async methods(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'methodology.design');
    return this.response.build('methodology', { id, part }, 'Methods');
  }

  @Get('techniques')
  @ApiOperation({ summary: 'Obtener técnicas/instrumentos' })
  @ApiOkResponse({ description: 'Técnicas / Instrumentos' })
  async techniques(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'methodology.instruments');
    return this.response.build('methodology', { id, part }, 'Techniques');
  }

  @Get('procedures')
  @ApiOperation({ summary: 'Obtener procedimientos' })
  @ApiOkResponse({ description: 'Procedimientos' })
  async procedures(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'methodology.procedure');
    return this.response.build('methodology', { id, part }, 'Procedures');
  }

  @Get('work-plan')
  @ApiOperation({ summary: 'Obtener plan de trabajo/plan de análisis' })
  @ApiOkResponse({ description: 'Plan de trabajo / análisis' })
  async workPlan(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'methodology.analysisPlan');
    return this.response.build('methodology', { id, part }, 'Work plan');
  }

  @Get('timelines')
  @ApiOperation({ summary: 'Obtener cronograma' })
  @ApiOkResponse({ description: 'Cronograma' })
  async timelines(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'methodology.timeline');
    return this.response.build('methodology', { id, part }, 'Timelines');
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Actualizar una parte de la metodología por key' })
  @ApiOkResponse({ description: 'Parte de metodología actualizada' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: { title?: string; content?: string },
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.upsert(
      user,
      id,
      `methodology.${key}`,
      body,
    );
    return this.response.build('methodology', { id, part }, 'Updated');
  }
}
