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
import { Op } from 'sequelize';

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
            /*next: async () => {
              console.log('next', RmqMessagePatterns.SCRAPE_KEYWORD);
            },*/
            error: async (err) => {
              console.log('error', RmqMessagePatterns.SCRAPE_KEYWORD, err);
            },
          });
      }

      await transaction.commit();

      return 'Keywords successfully placed for scraping. Please wait a while';
    } catch (e) {
      console.log('eeee', e);
      await transaction.rollback();
      throw e;
    }
  }

  async getListData(queryDto: KeywordRecordSearchQueryDto, user: any) {
    const query = this.prepareListDataQuery(queryDto, user);

    const data = await this.keywordRecordModel.findAndCountAll({
      attributes: [
        'id',
        'keyword',
        'total_advertisers',
        'total_links',
        'total_search_results',
        'scraped_at',
        'read_at',
      ],
      order: [['scraped_at', 'asc']],
      ...query,
    });

    return {
      data: data.rows,
      paginate: {
        total: data.count,
        per_page: query.limit,
        current_page:
          query.limit === 0 ? 0 : Math.floor(query.offset / query.limit),
      },
    };
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

  private prepareListDataQuery(
    queryDto: KeywordRecordSearchQueryDto,
    user: any,
  ) {
    const query: any = { limit: 10, offset: 0 };
    if (queryDto.limit < 500) {
      query.limit = queryDto.limit;
    }

    if (queryDto?.page && queryDto.page > 0) {
      query.offset = queryDto.page * query.limit;
    }

    query.where = {
      user_id: user.id,
    };

    if (queryDto?.keyword?.length) {
      query.where['keyword'] = { [Op.like]: `%${queryDto.keyword}%` };
    } else if (queryDto?.search?.length) {
      query.where['keyword'] = { [Op.like]: `%${queryDto.search}%` };
    }

    return query;
  }
}
