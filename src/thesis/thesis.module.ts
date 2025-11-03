import { Module } from '@nestjs/common';
import { PreliminariesModule } from './preliminaries/preliminaries.module';
import { IntroductionModule } from './introduction/introduction.module';
import { ChaptersModule } from './chapters/chapters.module';
import { MethodologyModule } from './methodology/methodology.module';
import { ResultsModule } from './results/results.module';
import { ConclusionsModule } from './conclusions/conclusions.module';
import { ReferencesModule } from './references/references.module';
import { AppendicesModule } from './appendices/appendices.module';

@Module({
  imports: [
    PreliminariesModule,
    IntroductionModule,
    ChaptersModule,
    MethodologyModule,
    ResultsModule,
    ConclusionsModule,
    ReferencesModule,
    AppendicesModule,
  ],
})
export class ThesisModule {}
