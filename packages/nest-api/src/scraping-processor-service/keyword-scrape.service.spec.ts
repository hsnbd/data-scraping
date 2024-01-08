import { Test, TestingModule } from '@nestjs/testing';
import * as puppeteer from 'puppeteer';
import { KeywordScrapeService } from './keyword-scrape.service';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { SCRAPING_DONE } from '../core/constants';
import { ScrapeJobDonePayload, ScrapeKeywordPayload } from '../core/types';
import { GooglePageSelectors, RmqMessagePatterns } from '../core/enums';
import { Page } from 'puppeteer';

jest.mock('puppeteer');

describe('KeywordScrapeService', () => {
  let service: KeywordScrapeService;
  let mockRmqClient: ClientProxy;

  beforeEach(async () => {
    mockRmqClient = {
      emit: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordScrapeService,
        { provide: SCRAPING_DONE, useValue: mockRmqClient },
      ],
    }).compile();

    service = module.get<KeywordScrapeService>(KeywordScrapeService);
  });

  it('should scrape keyword successfully', async () => {
    const mockData: ScrapeKeywordPayload = { id: 1, keyword: 'example' };
    const mockPage = {
      setDefaultNavigationTimeout: jest.fn(),
      goto: jest.fn(),
      content: jest.fn().mockReturnValueOnce(Promise.resolve('<h1>hello</h1>')),
      close: jest.fn(),
      $$eval: jest.fn(),
      $eval: jest.fn(),
      setViewport: jest.fn(),
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    Reflect.set(
      service,
      'parsePageResultState',
      jest
        .fn()
        .mockReturnValueOnce(Promise.resolve('124343 result in 1.23 sec')),
    );
    Reflect.set(
      service,
      'parsePageAdvertisersLinkAndCount',
      jest.fn().mockReturnValueOnce(Promise.resolve(10)),
    );
    Reflect.set(
      service,
      'parsePageAllLinkAndCount',
      jest.fn().mockReturnValueOnce(Promise.resolve(10)),
    );

    const result = await service.scrapeKeyword(mockData);
    console.log(result);
    expect(result).toEqual({
      ...mockData,
      total_search_results: expect.any(String),
      total_advertisers: expect.any(Number),
      total_links: expect.any(Number),
      html_code: expect.any(String),
    });
    expect(mockPage.setDefaultNavigationTimeout).toHaveBeenCalledWith(60000);
    expect(mockPage.setViewport).toHaveBeenCalledWith({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
    });
    expect(mockPage.goto).toHaveBeenCalledWith(
      'https://www.google.com/search?q=example',
      { waitUntil: 'networkidle0' },
    );
    expect(mockPage.content).toHaveBeenCalled();
    expect(mockPage.close).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should handle error during scraping', async () => {
    const mockData: ScrapeKeywordPayload = { id: 1, keyword: 'example' };
    const mockError = new Error('Scraping failed');

    const mockPage = {
      setDefaultNavigationTimeout: jest.fn(),
      close: jest.fn(),
      setViewport: jest.fn().mockRejectedValue(mockError),
    };
    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    await expect(service.scrapeKeyword(mockData)).rejects.toThrow(mockError);

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  describe('parsePageResultState', () => {
    it('should parse page result state correctly', async () => {
      const mockPage: Page = {} as Page;
      mockPage.$eval = jest.fn().mockResolvedValue('Mocked Result');

      const result = await service['parsePageResultState'](mockPage);

      expect(mockPage.$eval).toHaveBeenCalledWith(
        GooglePageSelectors.RESULT_STATS,
        expect.any(Function),
      );
      expect(result).toBe('Mocked Result');
    });
  });

  describe('parsePageAdvertisersLinkAndCount', () => {
    it('should parse advertisers link and count correctly', async () => {
      const mockPage: Page = {} as Page;
      mockPage.$$eval = jest.fn().mockImplementation((selector, callback) => {
        if (selector === GooglePageSelectors.SPONSOR_1_LINKS) {
          return callback([
            { getAttribute: jest.fn().mockReturnValue('http://example.com') },
            { getAttribute: jest.fn().mockReturnValue('http://example2.com') },
          ]);
        }
      });

      const result =
        await service['parsePageAdvertisersLinkAndCount'](mockPage);

      expect(mockPage.$$eval).toHaveBeenCalledWith(
        GooglePageSelectors.SPONSOR_1_LINKS,
        expect.any(Function),
      );
      expect(result).toBe(2);
    });

    it('should handle error during parsing', async () => {
      const mockPage: Page = {} as Page;
      mockPage.$$eval = jest.fn().mockImplementationOnce(() => {
        throw new Error('Parsing error');
      });

      const result =
        await service['parsePageAdvertisersLinkAndCount'](mockPage);

      expect(mockPage.$$eval).toHaveBeenCalledWith(
        GooglePageSelectors.SPONSOR_1_LINKS,
        expect.any(Function),
      );
      expect(result).toBe(0);
    });
  });

  describe('parsePageAllLinkAndCount', () => {
    it('should parse all page links and count correctly', async () => {
      const mockPage: Page = {} as Page;
      mockPage.$$eval = jest.fn().mockImplementation((selector, callback) => {
        if (selector === GooglePageSelectors.ALL_PAGE_LINKS) {
          return callback(['link1', 'link2']);
        }
      });

      const result = await service['parsePageAllLinkAndCount'](mockPage);

      expect(mockPage.$$eval).toHaveBeenCalledWith(
        GooglePageSelectors.ALL_PAGE_LINKS,
        expect.any(Function),
      );
      expect(result).toBe(2);
    });

    it('should handle error during parsing', async () => {
      const mockPage: Page = {} as Page;
      mockPage.$$eval = jest.fn().mockImplementationOnce(() => {
        throw new Error('Parsing error');
      });

      const result = await service['parsePageAllLinkAndCount'](mockPage);

      expect(mockPage.$$eval).toHaveBeenCalledWith(
        GooglePageSelectors.ALL_PAGE_LINKS,
        expect.any(Function),
      );
      expect(result).toBe(0);
    });
  });

  describe('notifyScrapingDoneStatus', () => {
    it('should notify scraping done status correctly', () => {
      const mockResult: ScrapeJobDonePayload = {
        id: 1,
        keyword: 'testing',
        total_search_results: 'testing',
        total_advertisers: 1,
        total_links: 1,
        html_code: 'testing',
      };
      const mockRecord = new RmqRecordBuilder(mockResult).build();

      Reflect.set(service, 'rmqClient', {
        emit: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      } as any);

      jest.spyOn(service['rmqClient'], 'emit').mockReturnValue({
        subscribe: jest.fn(),
      } as any);

      service['notifyScrapingDoneStatus'](mockResult);

      expect(service['rmqClient'].emit).toHaveBeenCalledWith(
        RmqMessagePatterns.SCRAPING_JOB_DONE,
        mockRecord,
      );
    });
  });
});
