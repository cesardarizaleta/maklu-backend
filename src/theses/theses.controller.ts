import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { ThesesService } from './theses.service';
import type { ApiResponse } from '../common/responses/api-response';
import { ok } from '../common/responses/api-response';
import { CreateThesisDto } from './dto/create-thesis.dto';
import { CreateThesisFromIdeaDto } from './dto/create-thesis-from-idea.dto';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@ApiTags('theses')
@ApiBearerAuth('bearer')
@Controller('theses')
export class ThesesController {
  constructor(private readonly thesesService: ThesesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una tesis manualmente con título' })
  @ApiOkResponse({ description: 'Tesis creada' })
  async create(
    @Req() req: Request,
    @Body() dto: CreateThesisDto,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const thesis = await this.thesesService.create(user, dto.title);
    return ok(thesis, 'Thesis created');
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las tesis del usuario' })
  @ApiOkResponse({ description: 'Listado de tesis' })
  async list(@Req() req: Request): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const theses = await this.thesesService.list(user);
    return ok(theses, 'Theses list');
  }

  @Get(':id/tree')
  @ApiOperation({ summary: 'Obtener árbol de partes de una tesis' })
  @ApiOkResponse({ description: 'Árbol de partes' })
  async tree(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const parts = await this.thesesService.getTree(user, id);
    return ok(parts, 'Thesis parts tree');
  }

  @Get(':id/full')
  @ApiOperation({ summary: 'Obtener una tesis completa con todas sus partes' })
  @ApiOkResponse({
    description: 'Tesis completa con contenido de todas las secciones',
  })
  async full(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const data = await this.thesesService.getFull(user, id);
    return ok(data, 'Thesis full content');
  }

  @Post('idea')
  @ApiOperation({
    summary: 'Generar una tesis a partir de una idea (opcional disciplina)',
  })
  @ApiOkResponse({ description: 'Generación iniciada; retorna id y título' })
  async createFromIdea(
    @Req() req: Request,
    @Body() dto: CreateThesisFromIdeaDto,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    if (!dto.idea || !dto.idea.trim()) {
      throw new BadRequestException('idea is required');
    }
    const thesis = await this.thesesService.createFromIdea(
      user,
      dto.idea.trim(),
      dto.discipline,
    );
    // Importante: devolver solo el título (y el id para futuras consultas)
    return ok(
      { id: thesis.id, title: thesis.title },
      'Thesis generation started',
    );
  }
}
