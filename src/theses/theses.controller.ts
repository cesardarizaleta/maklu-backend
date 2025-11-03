import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { ThesesService } from './theses.service.js';
import type { ApiResponse } from '../common/responses/api-response';
import { ok } from '../common/responses/api-response';
import type { CreateThesisDto } from './dto/create-thesis.dto';
import type { CreateThesisFromIdeaDto } from './dto/create-thesis-from-idea.dto';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('theses')
export class ThesesController {
  constructor(private readonly thesesService: ThesesService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateThesisDto,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const thesis = await this.thesesService.create(user, dto.title);
    return ok(thesis, 'Thesis created');
  }

  @Get()
  async list(@Req() req: Request): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const theses = await this.thesesService.list(user);
    return ok(theses, 'Theses list');
  }

  @Get(':id/tree')
  async tree(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const parts = await this.thesesService.getTree(user, id);
    return ok(parts, 'Thesis parts tree');
  }

  @Post('idea')
  async createFromIdea(
    @Req() req: Request,
    @Body() dto: CreateThesisFromIdeaDto,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const thesis = await this.thesesService.createFromIdea(
      user,
      dto.idea,
      dto.discipline,
    );
    // Importante: devolver solo el título (y el id para futuras consultas)
    return ok(
      { id: thesis.id, title: thesis.title },
      'Thesis generation started',
    );
  }

  @Get(':id/parts/:key')
  async getPart(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('key') key: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.thesesService.getPart(user, id, key);
    return ok(part, 'Thesis part');
  }
}
