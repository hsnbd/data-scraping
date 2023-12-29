import { Module } from '@nestjs/common';
import { KeywordRecordController } from './keyword-record.controller';
import { KeywordRecordService } from './services/keyword-record.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { KeywordRecord } from './models/keyword-record.model';
import { ClientsModule } from '@nestjs/microservices';
import { RmqScrapingSendingConfigService } from '../core/config/rmq/rmq-scraping-sending-config.service';
import { SCRAPING_SENDING } from '../core/constants';

@Module({
  imports: [
    SequelizeModule.forFeature([KeywordRecord]),
    ClientsModule.registerAsync([
      { useClass: RmqScrapingSendingConfigService, name: SCRAPING_SENDING },
    ]),
  ],
  controllers: [KeywordRecordController],
  providers: [KeywordRecordService],
  exports: [KeywordRecordService, SequelizeModule],
})
export class KeywordScrapingModule {}
