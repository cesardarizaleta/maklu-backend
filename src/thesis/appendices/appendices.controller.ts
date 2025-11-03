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
@ApiTags('Thesis - Appendices')
@Controller('thesis/:id/appendices')
export class AppendicesController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la sección de apéndices' })
  @ApiOkResponse({ description: 'Apéndices de la tesis' })
  async get(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'appendices');
    return this.response.build('appendices', { id, part }, 'Appendices');
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar la sección de apéndices' })
  @ApiOkResponse({ description: 'Apéndices actualizados' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.upsert(user, id, 'appendices', body);
    return this.response.build('appendices', { id, part }, 'Updated');
  }
}
