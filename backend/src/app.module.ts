import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        url: configService.getOrThrow<string>(
          'DATABASE_URL',
        ),

        autoLoadEntities: true,

        synchronize:
          configService.get<string>(
            'TYPEORM_SYNC',
          ) === 'true',
      }),
    }),

    UsuarioModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}