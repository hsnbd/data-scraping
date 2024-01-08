import { Test, TestingModule } from '@nestjs/testing';
import { KeywordRecordController } from './keyword-record.controller';
import { KeywordRecordService } from './services/keyword-record.service';
import { KeywordRecordSearchQueryDto } from './dto/keyword-record-search-query.dto';
import { KeywordRecord } from './models/keyword-record.model';
import { StreamableFile } from '@nestjs/common';
import { ScrapeJobDonePayload } from '../core/types';
import { RmqContext } from '@nestjs/microservices';

jest.mock('./services/keyword-record.service');

describe('AuthController', () => {
  let controller: KeywordRecordController;
  let keywordRecordService: KeywordRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeywordRecordController],
      providers: [KeywordRecordService],
    }).compile();

    controller = module.get<KeywordRecordController>(KeywordRecordController);
    keywordRecordService =
      module.get<KeywordRecordService>(KeywordRecordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(keywordRecordService).toBeDefined();
  });

  describe('listAllKeywordRecords', () => {
    it('should return list of keyword records with paginate', async () => {
      const req = {
        user: jest.fn(),
      };
      const dto = new KeywordRecordSearchQueryDto();
      const mockValue = {
        data: [],
        paginate: { total: 0, per_page: 0, current_page: 0 },
      };

      jest
        .spyOn(keywordRecordService, 'getListData')
        .mockReturnValueOnce(Promise.resolve(mockValue));

      const result = await controller.listAllKeywordRecords(req, dto);

      expect(result).toEqual(mockValue);
    });
  });
  describe('uploadKeywordRecords', () => {
    it('should process csv file and keywords', async () => {
      const file: Express.Multer.File = {
        originalname: 'file.csv',
        mimetype: 'text/csv',
        path: 'file',
        fieldname: 'file',
        encoding: 'utf-8',
        size: 122344564,
        destination: '/temp',
        filename: 'file.csv',
        buffer: Buffer.from('one,two,three'),
        stream: new StreamableFile(Buffer.from('one,two,three')).getStream(),
      };
      const req = {
        user: jest.fn(),
      };

      const mockValue =
        'Keywords successfully placed for scraping. Please wait a while';

      jest
        .spyOn(keywordRecordService, 'processCsvFile')
        .mockReturnValueOnce(
          Promise.resolve(['testing1', 'testing2', 'testing3']),
        );

      jest
        .spyOn(keywordRecordService, 'processKeywords')
        .mockReturnValueOnce(Promise.resolve(mockValue));

      const result = await controller.uploadKeywordRecords(file, req);
      expect(result).toBe(mockValue);
    });
  });
  describe('singleKeywordRecord', () => {
    it('should return single keyword record', async () => {
      const mockModelValue = {
        id: 10,
        keyword: 'Coursera',
        user_id: 1,
        total_advertisers: 5,
        total_links: 5,
        total_search_results: 'testing',
      } as KeywordRecord;

      jest
        .spyOn(keywordRecordService, 'findOneById')
        .mockReturnValueOnce(Promise.resolve(mockModelValue));
      const result = await controller.singleKeywordRecord(10);
      expect(result).toEqual(mockModelValue);
    });
  });
  describe('markAsRead', () => {
    it('should return mark as read keyword record', async () => {
      const mockModelValue = {
        id: 10,
        keyword: 'Coursera',
        user_id: 1,
        total_advertisers: 5,
        total_links: 5,
        total_search_results: 'testing',
      } as KeywordRecord;

      const mockModelValueAfterUpdate = {
        id: 10,
        keyword: 'Coursera',
        user_id: 1,
        total_advertisers: 5,
        total_links: 5,
        total_search_results: 'testing',
        read_at: new Date(),
      } as KeywordRecord;

      jest
        .spyOn(keywordRecordService, 'findOneById')
        .mockReturnValueOnce(Promise.resolve(mockModelValue));

      jest
        .spyOn(keywordRecordService, 'markAsRead')
        .mockReturnValueOnce(Promise.resolve(mockModelValueAfterUpdate));

      const result = await controller.markAsRead(10);
      expect(result).toEqual(mockModelValueAfterUpdate);
    });
  });
  describe('scrapingJobDone', () => {
    it('should save scraping data and ack the message', async () => {
      const data: ScrapeJobDonePayload = {
        id: 10,
        keyword: 'Coursera',
        total_advertisers: 5,
        total_links: 5,
        total_search_results: 'testing',
        html_code: 'testing',
      };
      const context = {
        getChannelRef: jest.fn(),
        getMessage: jest.fn(),
      } as unknown as RmqContext;

      const channelAckMock = jest.fn();
      const channelNackMock = jest.fn();
      const originalMsgMock = {};

      (context.getChannelRef as jest.Mock).mockReturnValue({
        ack: channelAckMock,
        nack: channelNackMock,
      });
      (context.getMessage as jest.Mock).mockReturnValue(originalMsgMock);

      await controller.scrapingJobDone(data, context);

      expect(keywordRecordService.saveScrapingData).toHaveBeenCalledWith(data);
      expect(channelAckMock).toHaveBeenCalledWith(originalMsgMock);
      expect(channelNackMock).not.toHaveBeenCalled();
    });

    it('should nack the message and catch error if an exception occurs', async () => {
      const data: ScrapeJobDonePayload = {
        id: 10,
        keyword: 'Coursera',
        total_advertisers: 5,
        total_links: 5,
        total_search_results: 'testing',
        html_code: 'testing',
      };
      const context = {
        getChannelRef: jest.fn(),
        getMessage: jest.fn(),
      } as unknown as RmqContext;

      const channelAckMock = jest.fn();
      const channelNackMock = jest.fn();
      const originalMsgMock = {};

      (context.getChannelRef as jest.Mock).mockReturnValue({
        ack: channelAckMock,
        nack: channelNackMock,
      });
      (context.getMessage as jest.Mock).mockReturnValue(originalMsgMock);

      const error = new Error('Something went wrong');
      jest
        .spyOn(keywordRecordService, 'saveScrapingData')
        .mockRejectedValueOnce(error);

      await controller.scrapingJobDone(data, context);

      expect(keywordRecordService.saveScrapingData).toHaveBeenCalledWith(data);
      expect(channelAckMock).not.toHaveBeenCalled();
      expect(channelNackMock).toHaveBeenCalledWith(
        originalMsgMock,
        false,
        true,
      );
    });
  });
});
