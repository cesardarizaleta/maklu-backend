import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
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
@ApiTags('Thesis - Preliminaries')
@Controller('thesis/:id/preliminaries')
export class PreliminariesController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar partes disponibles de preliminares' })
  @ApiOkResponse({ description: 'Listado de keys de preliminares' })
  list(@Param('id') id: string): ApiResponse {
    // Lista potencial de preliminares (pueden no existir aún)
    const items = [
      'preliminaries.cover',
      'preliminaries.signatures',
      'preliminaries.dedication',
      'preliminaries.acknowledgments',
      'preliminaries.tableOfContents',
      'preliminaries.lists.figures',
      'preliminaries.lists.tables',
      'preliminaries.lists.graphs',
      'preliminaries.abstract',
    ];
    return this.response.build(
      'preliminaries',
      { id, items },
      'Preliminary pages',
    );
  }

  @Get('cover')
  @ApiOperation({ summary: 'Obtener portada' })
  @ApiOkResponse({ description: 'Portada' })
  async cover(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'preliminaries.cover');
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Cover page',
    );
  }

  @Get('signatures')
  @ApiOperation({ summary: 'Obtener página de firmas' })
  @ApiOkResponse({ description: 'Firmas' })
  async signatures(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'preliminaries.signatures');
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Signatures page',
    );
  }

  @Get('dedication')
  @ApiOperation({ summary: 'Obtener dedicatoria' })
  @ApiOkResponse({ description: 'Dedicatoria' })
  async dedication(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'preliminaries.dedication');
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Dedication',
    );
  }

  @Get('acknowledgments')
  @ApiOperation({ summary: 'Obtener agradecimientos' })
  @ApiOkResponse({ description: 'Agradecimientos' })
  async acknowledgments(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'preliminaries.acknowledgments',
    );
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Acknowledgments',
    );
  }

  @Get('table-of-contents')
  @ApiOperation({ summary: 'Obtener tabla de contenido' })
  @ApiOkResponse({ description: 'Tabla de contenido' })
  async toc(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'preliminaries.tableOfContents',
    );
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Table of contents',
    );
  }

  @Get('lists/figures')
  @ApiOperation({ summary: 'Obtener lista de figuras' })
  @ApiOkResponse({ description: 'Lista de figuras' })
  async listFigures(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'preliminaries.lists.figures',
    );
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'List of figures',
    );
  }

  @Get('lists/tables')
  @ApiOperation({ summary: 'Obtener lista de tablas' })
  @ApiOkResponse({ description: 'Lista de tablas' })
  async listTables(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'preliminaries.lists.tables',
    );
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'List of tables',
    );
  }

  @Get('lists/graphs')
  @ApiOperation({ summary: 'Obtener lista de gráficos' })
  @ApiOkResponse({ description: 'Lista de gráficos' })
  async listGraphs(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(
      user,
      id,
      'preliminaries.lists.graphs',
    );
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'List of graphs',
    );
  }

  @Get('abstract')
  @ApiOperation({ summary: 'Obtener el resumen/abstract' })
  @ApiOkResponse({ description: 'Resumen / Abstract' })
  async abstract(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'preliminaries.abstract');
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Abstract',
    );
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Actualizar una parte de preliminares por key' })
  @ApiOkResponse({ description: 'Parte de preliminares actualizada' })
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
      `preliminaries.${key}`,
      body,
    );
    return this.response.build(
      'preliminaries',
      { id, key: part.key, part },
      'Updated',
    );
  }
}
