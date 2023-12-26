import { Module } from '@nestjs/common';
import { KeywordScrapingController } from './keyword-scraping.controller';
import { KeywordScrapingService } from './services/keyword-scraping.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { KeywordRecord } from './models/keyword-record.model';

@Module({
  imports: [SequelizeModule.forFeature([KeywordRecord])],
  controllers: [KeywordScrapingController],
  providers: [KeywordScrapingService],
  exports: [KeywordScrapingService, SequelizeModule],
})
export class KeywordScrapingModule {}
