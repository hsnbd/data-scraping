import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import * as Papa from 'papaparse';
import { InjectModel } from '@nestjs/sequelize';
import { KeywordRecord } from '../models/keyword-record.model';
import { Sequelize } from 'sequelize-typescript';
import { KeywordRecordSearchQueryDto } from '../dto/keyword-record-search-query.dto';
import { SCRAPING_SENDING } from '../../core/constants';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { KeywordRecordStatus, RmqMessagePatterns } from '../../core/enums';
import { ScrapeJobDonePayload } from '../../core/types';

@Injectable()
export class KeywordRecordService {
  @Inject()
  private readonly sequelize: Sequelize;

  @Inject(SCRAPING_SENDING)
  private readonly rmqClient: ClientProxy;

  @InjectModel(KeywordRecord)
  private readonly keywordRecordModel: typeof KeywordRecord;

  async processCsvFile(file: Express.Multer.File): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      const streamableObject = new StreamableFile(file.buffer);
      const readStream = streamableObject.getStream();

      Papa.parse(readStream, {
        worker: false,
        header: false,
        complete: (results: Papa.ParseResult<Array<string>>) => {
          resolve(
            results.data
              .flat()
              .map((value) => value.trim())
              .filter((value) => value.length),
          );
        },
        error: reject,
      });
    });
  }

  async processKeywords(authUser: any, keywords: Array<string>) {
    const startTime = process.hrtime();

    // TODO: ask how many words are valid keyword and length of a valid keyword?
    // TODO: Search across all reports. (What would be the purpose of this search)?
    // TODO: The total number of links (all of them) on the page. ? (Google now use infinity scrolling. SO now all of them means all of them in initial load)?
    // Exclude already scraped keywords
    // Add Auth id to keywords
    // Store all keywords to db
    // Scrape keywords and update records
    // Return back to the user

    const transaction = await this.sequelize.transaction();
    try {
      const existingKeywordRecords = await this.keywordRecordModel.findAll({
        attributes: ['keyword'],
        where: {
          keyword: keywords,
        },
        raw: true,
        transaction,
      });

      const existingKeywordArray = existingKeywordRecords.map(
        (item) => item.keyword,
      );

      const newKeywords = keywords.filter(
        (keyword) => !existingKeywordArray.includes(keyword),
      );

      const newKeywordRecords = await this.keywordRecordModel.bulkCreate(
        newKeywords.map((keyword) => ({
          keyword: keyword,
          user_id: authUser.id,
        })),
        { transaction },
      );

      for (let i = 0; i < newKeywordRecords.length; i++) {
        const keywordRecord = newKeywordRecords[i];

        const record = new RmqRecordBuilder({
          keyword: keywordRecord.keyword,
          id: keywordRecord.id,
        }).build();

        this.rmqClient
          .emit(RmqMessagePatterns.SCRAPE_KEYWORD, record)
          .subscribe({
            next: async () => {
              console.log('next', RmqMessagePatterns.SCRAPE_KEYWORD);
            },
            error: async (err) => {
              console.log('error', RmqMessagePatterns.SCRAPE_KEYWORD);
              console.error('client.emit,err,', err);
            },
            // complete: () => {},
          });
      }

      await transaction.commit();

      const endTime = process.hrtime(startTime);
      const elapsedTimeInSeconds = endTime[0] + endTime[1] / 1e9;
      return `Script took ${elapsedTimeInSeconds.toFixed(4)} seconds to run.`;
    } catch (e) {
      console.log('eeee', e);
      await transaction.rollback();
      throw e;
    }
  }

  getListData(queryDto: KeywordRecordSearchQueryDto) {
    console.log('queryDto', queryDto);
    return this.keywordRecordModel.findAll({
      attributes: [
        'id',
        'keyword',
        'total_advertisers',
        'total_links',
        'total_search_results',
        'read_at',
      ],
      limit: 10,
      order: [['scraped_at', 'desc']],
    });
  }

  findOneById(id: number) {
    return this.keywordRecordModel.findByPk(id);
  }

  async markAsRead(id: number) {
    const keywordRecord = await this.findOneById(id);
    keywordRecord.read_at = new Date();
    await keywordRecord.save();

    return keywordRecord;
  }

  async saveScrapingData(data: ScrapeJobDonePayload) {
    try {
      console.log(
        'keywordRecord',
        await this.keywordRecordModel.findByPk(data.id),
      );
      console.log('keywordRecord', data);
      const keywordRecord = await this.findOneById(data.id);
      delete data['id'];
      keywordRecord.set(data);
      keywordRecord.scraped_at = new Date();
      keywordRecord.row_status = KeywordRecordStatus.DONE;
      await keywordRecord.save();
    } catch (e) {
      console.log('eeee', e);
      throw e;
    }
  }
}
