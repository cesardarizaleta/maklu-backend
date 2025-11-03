import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ApiResponse } from '../../common/responses/api-response';
import { ThesisResponseService } from '../shared/thesis-response.service';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('preliminaries')
export class PreliminariesController {
  constructor(private readonly response: ThesisResponseService) {}

  @Get()
  list(): ApiResponse {
    return this.response.build('preliminaries', undefined, 'Preliminary pages');
  }

  @Get('cover')
  cover(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'cover' },
      'Cover page',
    );
  }

  @Get('signatures')
  signatures(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'signatures' },
      'Signatures page',
    );
  }

  @Get('dedication')
  dedication(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'dedication' },
      'Dedication',
    );
  }

  @Get('acknowledgments')
  acknowledgments(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'acknowledgments' },
      'Acknowledgments',
    );
  }

  @Get('table-of-contents')
  toc(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'table-of-contents' },
      'Table of contents',
    );
  }

  @Get('lists/figures')
  listFigures(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'lists-figures' },
      'List of figures',
    );
  }

  @Get('lists/tables')
  listTables(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'lists-tables' },
      'List of tables',
    );
  }

  @Get('lists/graphs')
  listGraphs(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'lists-graphs' },
      'List of graphs',
    );
  }

  @Get('abstract')
  abstract(): ApiResponse {
    return this.response.build(
      'preliminaries',
      { subpart: 'abstract' },
      'Abstract',
    );
  }
}
