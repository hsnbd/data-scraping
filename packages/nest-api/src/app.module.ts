import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './core/config/app-config';
import { WinstonModule } from 'nest-winston';
import { WinstonConfigService } from './core/config/winston/winston-config.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './core/config/sequelize/sequelize-config.service';
import { AuthModule } from './auth-module/auth.module';
import { KeywordScrapingModule } from './keyword-scraping-module/keyword-scraping.module';
import { ClientsModule } from '@nestjs/microservices';
import { RmqScrapingSendingConfigService } from './core/config/rmq/rmq-scraping-sending-config.service';
import { SCRAPING_SENDING } from './core/constants';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot(appConfig),
    WinstonModule.forRootAsync({
      useClass: WinstonConfigService,
    }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    ClientsModule.registerAsync([
      { useClass: RmqScrapingSendingConfigService, name: SCRAPING_SENDING },
    ]),
    AuthModule,
    KeywordScrapingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
