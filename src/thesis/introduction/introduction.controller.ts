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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(ApiKeyGuard)
@ApiBearerAuth()
@ApiTags('Thesis - Introduction')
@Controller('thesis/:id/introduction')
export class IntroductionController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar partes disponibles de la introducción' })
  @ApiOkResponse({ description: 'Listado de keys de introducción' })
  list(@Param('id') id: string): ApiResponse {
    const items = [
      'introduction.problemStatement',
      'introduction.researchQuestions',
      'introduction.justification',
      'introduction.scope',
      'introduction.delimitations',
      'introduction.limitations',
      'introduction.generalObjective',
      'introduction.specificObjectives',
    ];
    return this.response.build('introduction', { id, items }, 'Introduction');
  }

  @Get('problem-statement')
  @ApiOperation({ summary: 'Obtener el planteamiento del problema' })
  @ApiOkResponse({ description: 'Planteamiento del problema' })
  async problemStatement(
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
      'introduction',
      { id, part },
      'Problem statement',
    );
  }

  @Get('research-questions')
  @ApiOperation({ summary: 'Obtener las preguntas de investigación' })
  @ApiOkResponse({ description: 'Preguntas de investigación' })
  async researchQuestions(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'introduction.researchQuestions',
    );
    return this.response.build(
      'introduction',
      { id, part },
      'Research questions',
    );
  }

  @Get('justification')
  @ApiOperation({ summary: 'Obtener la justificación' })
  @ApiOkResponse({ description: 'Justificación' })
  async justification(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'introduction.justification',
    );
    return this.response.build('introduction', { id, part }, 'Justification');
  }

  @Get('scope')
  @ApiOperation({ summary: 'Obtener el alcance' })
  @ApiOkResponse({ description: 'Alcance' })
  async scope(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'introduction.scope');
    return this.response.build('introduction', { id, part }, 'Scope');
  }

  @Get('delimitations')
  @ApiOperation({ summary: 'Obtener las delimitaciones' })
  @ApiOkResponse({ description: 'Delimitaciones' })
  async delimitations(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'introduction.delimitations',
    );
    return this.response.build('introduction', { id, part }, 'Delimitations');
  }

  @Get('limitations')
  @ApiOperation({ summary: 'Obtener las limitaciones' })
  @ApiOkResponse({ description: 'Limitaciones' })
  async limitations(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'introduction.limitations');
    return this.response.build('introduction', { id, part }, 'Limitations');
  }

  @Get('objectives/general')
  @ApiOperation({ summary: 'Obtener el objetivo general' })
  @ApiOkResponse({ description: 'Objetivo general' })
  async generalObjective(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'introduction.generalObjective',
    );
    return this.response.build(
      'introduction',
      { id, part },
      'General objective',
    );
  }

  @Get('objectives/specific')
  @ApiOperation({ summary: 'Obtener los objetivos específicos' })
  @ApiOkResponse({ description: 'Objetivos específicos' })
  async specificObjectives(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'introduction.specificObjectives',
    );
    return this.response.build(
      'introduction',
      { id, part },
      'Specific objectives',
    );
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Actualizar una parte de la introducción por key' })
  @ApiOkResponse({ description: 'Parte de introducción actualizada' })
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
      `introduction.${key}`,
      body,
    );
    return this.response.build('introduction', { id, part }, 'Updated');
  }
}
