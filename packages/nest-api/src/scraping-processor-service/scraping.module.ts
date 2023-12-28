import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../core/config/app-config';
import { WinstonModule } from 'nest-winston';
import { WinstonConfigService } from '../core/config/winston/winston-config.service';
import { ClientsModule } from '@nestjs/microservices';
import { SCRAPING_DONE } from '../core/constants';
import { ScrapingController } from './scraping.controller';
import { KeywordScrapeService } from './keyword-scrape.service';
import { RmqScrapingDoneConfigService } from '../core/config/rmq/rmq-scraping-done-config.service';

@Module({
  imports: [
    ConfigModule.forRoot(appConfig),
    WinstonModule.forRootAsync({
      useClass: WinstonConfigService,
    }),
    ClientsModule.registerAsync([
      { useClass: RmqScrapingDoneConfigService, name: SCRAPING_DONE },
    ]),
  ],
  controllers: [ScrapingController],
  providers: [KeywordScrapeService],
})
export class ScrapingModule {}
