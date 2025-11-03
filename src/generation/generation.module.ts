import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from './gemini.service';
import { ThesisGeneratorService } from './thesis-generator.service';
import { PromptLoaderService } from './prompt-loader.service';
import { Thesis } from '../theses/entities/thesis.entity.js';
import { ThesisPart } from '../theses/entities/thesis-part.entity.js';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Thesis, ThesisPart])],
  providers: [GeminiService, PromptLoaderService, ThesisGeneratorService],
  exports: [ThesisGeneratorService],
})
export class GenerationModule {}
