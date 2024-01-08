import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingController } from './scraping.controller';
import { KeywordScrapeService } from './keyword-scrape.service';
import { RmqContext } from '@nestjs/microservices';

jest.mock('./keyword-scrape.service');
describe('ScrapingController', () => {
  let controller: ScrapingController;
  let keywordScrapeService: KeywordScrapeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapingController],
      providers: [KeywordScrapeService],
    }).compile();

    controller = module.get<ScrapingController>(ScrapingController);
    keywordScrapeService =
      module.get<KeywordScrapeService>(KeywordScrapeService);
  });

  it('should scrape keyword successfully', async () => {
    const mockData = { id: 1, keyword: 'testing' };
    const mockResult = {
      id: 1,
      keyword: 'testing',
      total_search_results: 'testing',
      total_advertisers: 1,
      total_links: 1,
      html_code: 'testing',
    };

    const mockContext = {
      getChannelRef: jest.fn(),
      getMessage: jest.fn(),
    } as unknown as RmqContext;

    const channelAckMock = jest.fn();
    const channelNackMock = jest.fn();
    const originalMsgMock = {};

    (mockContext.getChannelRef as jest.Mock).mockReturnValue({
      ack: channelAckMock,
      nack: channelNackMock,
    });
    (mockContext.getMessage as jest.Mock).mockReturnValue(originalMsgMock);

    jest
      .spyOn(keywordScrapeService, 'scrapeKeyword')
      .mockResolvedValue(mockResult);
    jest
      .spyOn(keywordScrapeService, 'notifyScrapingDoneStatus')
      .mockReturnValue();

    await controller.scrapeKeyword(mockData, mockContext);

    expect(keywordScrapeService.scrapeKeyword).toHaveBeenCalledWith(mockData);
    expect(keywordScrapeService.notifyScrapingDoneStatus).toHaveBeenCalledWith(
      mockResult,
    );
    expect(channelAckMock).toHaveBeenCalled();
    expect(mockContext.getMessage()).toBeDefined();
  });

  it('should handle error during scraping', async () => {
    const mockData = { id: 1, keyword: 'testing' };

    const mockContext = {
      getChannelRef: jest.fn(),
      getMessage: jest.fn(),
    } as unknown as RmqContext;

    const channelAckMock = jest.fn();
    const channelNackMock = jest.fn();
    const originalMsgMock = {};

    (mockContext.getChannelRef as jest.Mock).mockReturnValue({
      ack: channelAckMock,
      nack: channelNackMock,
    });
    (mockContext.getMessage as jest.Mock).mockReturnValue(originalMsgMock);

    const mockError = new Error('Scraping failed');

    jest
      .spyOn(keywordScrapeService, 'scrapeKeyword')
      .mockRejectedValue(mockError);

    await controller.scrapeKeyword(mockData, mockContext);

    expect(keywordScrapeService.scrapeKeyword).toHaveBeenCalledWith(mockData);
    expect(channelNackMock).toHaveBeenCalledWith(
      mockContext.getMessage(),
      false,
      true,
    );
  });
});
