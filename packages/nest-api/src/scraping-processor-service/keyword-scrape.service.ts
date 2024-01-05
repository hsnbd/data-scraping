import { Inject, Injectable } from '@nestjs/common';
import { GooglePageSelectors, RmqMessagePatterns } from '../core/enums';
import { ScrapeJobDonePayload, ScrapeKeywordPayload } from '../core/types';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { SCRAPING_DONE } from '../core/constants';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class KeywordScrapeService {
  @Inject(SCRAPING_DONE)
  private readonly rmqClient: ClientProxy;

  async scrapeKeyword(data: ScrapeKeywordPayload) {
    const start = Date.now();

    const scrapedData = {
      ...data,
      total_search_results: '',
      total_advertisers: 0,
      total_links: 0,
      html_code: '',
    };
    const websiteUrl = `https://www.google.com/search?q=${encodeURIComponent(
      data.keyword,
    )}`;
    const response = await axios.get(websiteUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const $ = cheerio.load(response.data);

    scrapedData.total_search_results = await this.parsePageResultState($);

    scrapedData.total_advertisers =
      await this.parsePageAdvertisersLinkAndCount($);

    scrapedData.total_links = await this.parsePageAllLinkAndCount($);

    scrapedData.html_code = response.data;

    console.log('Took', Date.now() - start, 'ms');
    return scrapedData;
  }

  private async parsePageResultState(cheerioPageRef: any) {
    return cheerioPageRef(GooglePageSelectors.RESULT_STATS).text();
  }

  private async parsePageAdvertisersLinkAndCount(cheerioPageRef: any) {
    try {
      const links = cheerioPageRef(GooglePageSelectors.SPONSOR_1_ROOT).find(
        'a',
      );
      const uniqueLinksSet = new Set();
      links.each((index, link) => {
        const href = cheerioPageRef(link).attr('href');
        if (href) {
          try {
            const host = new URL(href).host;
            uniqueLinksSet.add(host);
          } catch (e) {}
        }
      });

      return uniqueLinksSet.size;
    } catch (error) {
      console.error('Error fetching or parsing HTML:', error.message);
      return 0;
    }
  }

  private async parsePageAllLinkAndCount(cheerioPageRef: any) {
    try {
      const links = cheerioPageRef('body').find('a');
      return links.length;
    } catch (e) {
      return 0;
    }
  }

  notifyScrapingDoneStatus(result: ScrapeJobDonePayload) {
    const record = new RmqRecordBuilder(result).build();

    this.rmqClient
      .emit(RmqMessagePatterns.SCRAPING_JOB_DONE, record)
      .subscribe({
        /*        next: async () => {
          console.log('next', RmqMessagePatterns.SCRAPING_JOB_DONE);
        },*/
        error: async (err) => {
          console.log('error', RmqMessagePatterns.SCRAPING_JOB_DONE, err);
        },
        // complete: () => {},
      });
  }
}
