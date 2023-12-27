import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import * as Papa from 'papaparse';
import { InjectModel } from '@nestjs/sequelize';
import { KeywordRecord } from '../models/keyword-record.model';
import { Sequelize } from 'sequelize-typescript';
import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import * as path from 'path';
import { GooglePageSelectors } from '../../core/enums';
import { KeywordRecordSearchQueryDto } from '../dto/keyword-record-search-query.dto';

@Injectable()
export class KeywordScrapingService {
  @Inject()
  private readonly sequelize: Sequelize;

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

  async scrapKeywords(authUser: any, keywords: Array<string>) {
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

      const browser = await puppeteer.launch({
        headless: false,
        userDataDir: path.join(__dirname, 'puppeteer-cache-dir'),
        // args: [`--proxy-server=112.109.16.51:8080`],
      });

      const processKeywordRecord = async (record: KeywordRecord) => {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        try {
          await page.setViewport({ width: 1280, height: 720 });

          const websiteUrl = `https://www.google.com/search?q=${encodeURIComponent(
            record.keyword,
          )}`;
          await page.goto(websiteUrl, { waitUntil: 'networkidle0' });

          record.total_search_results = await this.parsePageResultState(page);

          record.total_advertisers =
            await this.parsePageAdvertisersLinkAndCount(page);

          record.total_links = await this.parsePageAllLinkAndCount(page);

          record.html_code = await page.content();

          return record.save({ transaction });
        } finally {
          await page.close();
        }
      };

      await Promise.all(
        newKeywordRecords.map((record) => processKeywordRecord(record)),
      );

      // await this.keywordRecordModel.bulkCreate(results as Array<any>, {
      //   updateOnDuplicate: ['id'],
      //   transaction,
      // });

      await browser.close();

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

  private async parsePageResultState(page: Page) {
    return page.$eval(
      GooglePageSelectors.RESULT_STATS,
      (element) => element.textContent,
    );
  }

  private async parsePageAdvertisersLinkAndCount(page: Page) {
    try {
      return page.$$eval(GooglePageSelectors.SPONSOR_1_LINKS, (links) => {
        const uniqueLinksSet = new Set();

        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (href) {
            try {
              const host = new URL(href).host;
              uniqueLinksSet.add(host);
            } catch (e) {}
          }
        });
        return uniqueLinksSet.size;
      });
    } catch (e) {
      return 0;
    }
  }

  private async parsePageAllLinkAndCount(page: Page) {
    try {
      return page.$$eval(
        GooglePageSelectors.ALL_PAGE_LINKS,
        (links) => links.length,
      );
    } catch (e) {
      return 0;
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
      ],
      limit: 10,
    });
  }
}
