import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThesesController } from './theses.controller';
import { ThesesService } from './theses.service';
import { AuthModule } from '../auth/auth.module';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { Thesis } from './entities/thesis.entity';
import { ThesisPart } from './entities/thesis-part.entity';
import { GenerationModule } from '../generation/generation.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Thesis, ThesisPart]),
    GenerationModule,
  ],
  controllers: [ThesesController],
  providers: [ThesesService, ApiKeyGuard],
})
export class ThesesModule {}
