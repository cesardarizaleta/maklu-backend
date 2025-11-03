import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThesisResponseService } from './thesis-response.service';
import { ThesisSectionsService } from './thesis-sections.service';
import { Thesis } from '../../theses/entities/thesis.entity.js';
import { ThesisPart } from '../../theses/entities/thesis-part.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Thesis, ThesisPart])],
  providers: [ThesisResponseService, ThesisSectionsService],
  exports: [ThesisResponseService, ThesisSectionsService, TypeOrmModule],
})
export class ThesisSharedModule {}
