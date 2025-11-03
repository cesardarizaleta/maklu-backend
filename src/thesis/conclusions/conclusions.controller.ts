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
@ApiTags('Thesis - Conclusions')
@Controller('thesis/:id/conclusions')
export class ConclusionsController {
  constructor(
    private readonly response: ThesisResponseService,
    private readonly sections: ThesisSectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la sección de conclusiones' })
  @ApiOkResponse({ description: 'Conclusiones de la tesis' })
  async get(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.get(user, id, 'conclusions');
    return this.response.build('conclusions', { id, part }, 'Conclusions');
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar la sección de conclusiones' })
  @ApiOkResponse({ description: 'Conclusiones actualizadas' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
  ): Promise<ApiResponse> {
    const user = req.user as AuthenticatedUser;
    const part = await this.sections.upsert(user, id, 'conclusions', body);
    return this.response.build('conclusions', { id, part }, 'Updated');
  }
}
