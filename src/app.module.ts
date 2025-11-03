/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThesisModule } from './thesis/thesis.module';
import { AuthModule } from './auth/auth.module';
import { ThesesModule } from './theses/theses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: true,
          // Aiven/Postgres requiere SSL; en dev aceptamos CA auto-firmado
          ssl: { rejectUnauthorized: false },
        } as const;
      },
    }),
    ThesisModule,
    AuthModule,
    ThesesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
