import { Inject, Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import * as path from 'path';
import { GooglePageSelectors, RmqMessagePatterns } from '../core/enums';
import { ScrapeJobDonePayload, ScrapeKeywordPayload } from '../core/types';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { SCRAPING_DONE } from '../core/constants';

@Injectable()
export class KeywordScrapeService {
  @Inject(SCRAPING_DONE)
  private readonly rmqClient: ClientProxy;

  async scrapeKeyword(data: ScrapeKeywordPayload) {
    const start = Date.now();
    const browser = await puppeteer.launch({
      headless: 'new',
      userDataDir: path.join(__dirname, 'puppeteer-cache-dir'),
      args: [
        // `--proxy-server=112.109.16.51:8080`,
      ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    try {
      //TODO: I think html content should not be saved in db. it could be in file
      const scrapedData = {
        ...data,
        total_search_results: '',
        total_advertisers: 0,
        total_links: 0,
        html_code: '',
      };
      await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
      });

      const websiteUrl = `https://www.google.com/search?q=${encodeURIComponent(
        data.keyword,
      )}`;
      await page.goto(websiteUrl, { waitUntil: 'networkidle0' });

      scrapedData.total_search_results = await this.parsePageResultState(page);

      scrapedData.total_advertisers =
        await this.parsePageAdvertisersLinkAndCount(page);

      scrapedData.total_links = await this.parsePageAllLinkAndCount(page);

      scrapedData.html_code = await page.content();

      console.log('Took', Date.now() - start, 'ms');
      return scrapedData;
    } finally {
      await page.close();
      await browser.close();
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
