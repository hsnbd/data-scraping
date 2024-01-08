import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { KeywordRecordService } from './keyword-record.service';
import { KeywordRecord } from '../models/keyword-record.model';
import { StreamableFile } from '@nestjs/common';
import * as Papa from 'papaparse';
import { Duplex } from 'stream';
import { KeywordRecordSearchQueryDto } from '../dto/keyword-record-search-query.dto';
import { ScrapeJobDonePayload } from '../../core/types';
import { Op } from 'sequelize';

describe('KeywordRecordService', () => {
  let service: KeywordRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordRecordService,
        {
          provide: getModelToken(KeywordRecord),
          useValue: {},
        },
        {
          provide: Sequelize,
          useValue: {},
        },
        {
          provide: 'SCRAPING_SENDING',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<KeywordRecordService>(KeywordRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCsvFile', () => {
    it('should parse CSV file and return an array of strings', async () => {
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
      const mockStreamableObject = new StreamableFile(file.buffer);
      const mockReadStream = mockStreamableObject.getStream();

      const mockParse = jest.fn((stream, options): Duplex => {
        return options.complete({
          data: [['keyword1', 'keyword2', 'keyword3']],
        });
      });

      jest.spyOn(Papa, 'parse').mockImplementation(mockParse);
      jest
        .spyOn(StreamableFile.prototype, 'getStream')
        .mockReturnValue(mockReadStream);

      const result = await service.processCsvFile(file);
      expect(result).toEqual(['keyword1', 'keyword2', 'keyword3']);
      expect(mockParse).toHaveBeenCalledWith(mockReadStream, {
        worker: false,
        header: false,
        complete: expect.any(Function),
        error: expect.any(Function),
      });
    });
  });
  describe('processKeywords', () => {
    it('should process keywords and place them for scraping', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockKeywordRecordModel = {
        findAll: jest.fn(() => []),
        bulkCreate: jest.fn((data) => data.map((item) => ({ ...item, id: 1 }))),
      };
      const mockRmqClient = {
        emit: jest.fn(() => ({ subscribe: jest.fn() })),
      };

      Reflect.set(service, 'sequelize', {
        transaction: jest.fn().mockResolvedValue(mockTransaction as any),
      });
      Reflect.set(service, 'keywordRecordModel', mockKeywordRecordModel as any);
      Reflect.set(service, 'rmqClient', mockRmqClient as any);

      const authUser = { id: 1 };
      const keywords = ['keyword1', 'keyword2', 'keyword3'];
      const result = await service.processKeywords(authUser, keywords);

      expect(result).toEqual(
        'Keywords successfully placed for scraping. Please wait a while',
      );
      expect(mockKeywordRecordModel.findAll).toHaveBeenCalledWith({
        attributes: ['keyword'],
        where: {
          keyword: keywords,
        },
        raw: true,
        transaction: mockTransaction,
      });
      expect(mockKeywordRecordModel.bulkCreate).toHaveBeenCalledWith(
        keywords.map((keyword) => ({
          keyword,
          user_id: authUser.id,
        })),
        { transaction: mockTransaction },
      );
      expect(mockRmqClient.emit).toHaveBeenCalledTimes(keywords.length);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('getListData', () => {
    it('should get list data with pagination', async () => {
      const mockKeywordRecordModel = {
        findAndCountAll: jest.fn(() => ({
          rows: [
            {
              id: 1,
              keyword: 'example',
              total_advertisers: 10,
              total_links: 20,
              total_search_results: 30,
              scraped_at: new Date(),
              read_at: new Date(),
            },
          ],
          count: 1,
        })),
      };

      Reflect.set(service, 'keywordRecordModel', mockKeywordRecordModel as any);

      const queryDto: KeywordRecordSearchQueryDto = {
        page: 1,
        limit: 10,
        keyword: 'example',
      };
      const user = { id: 1 };
      const result = await service.getListData(queryDto, user);

      expect(result).toEqual({
        data: [
          {
            id: 1,
            keyword: 'example',
            total_advertisers: 10,
            total_links: 20,
            total_search_results: 30,
            scraped_at: expect.any(Date),
            read_at: expect.any(Date),
          },
        ],
        paginate: {
          total: 1,
          per_page: 10,
          current_page: 1,
        },
      });
      expect(mockKeywordRecordModel.findAndCountAll).toHaveBeenCalled();
    });
  });
  describe('findOneById', () => {
    it('should find a keyword record by ID', async () => {
      const mockKeywordRecordModel = {
        findByPk: jest.fn((id) => ({
          id,
          keyword: 'example',
          total_advertisers: 10,
          total_links: 20,
          total_search_results: 30,
          scraped_at: new Date(),
          read_at: new Date(),
        })),
      };

      Reflect.set(service, 'keywordRecordModel', mockKeywordRecordModel as any);

      const keywordRecordId = 1;
      const result = await service.findOneById(keywordRecordId);

      expect(result).toEqual({
        id: keywordRecordId,
        keyword: 'example',
        total_advertisers: 10,
        total_links: 20,
        total_search_results: 30,
        scraped_at: expect.any(Date),
        read_at: expect.any(Date),
      });
      expect(mockKeywordRecordModel.findByPk).toHaveBeenCalledWith(
        keywordRecordId,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a keyword record as read', async () => {
      const keywordRecordId = 1;
      const data = {
        id: keywordRecordId,
        keyword: 'example',
        total_advertisers: 10,
        total_links: 20,
        total_search_results: 'testing',
        scraped_at: new Date(),
        save: jest.fn(),
      };

      jest.spyOn(service, 'findOneById').mockImplementation((id) =>
        Promise.resolve({
          ...data,
          id,
        } as unknown as KeywordRecord),
      );

      const result = await service.markAsRead(keywordRecordId);

      expect(result).toEqual({ ...data, read_at: expect.any(Date) });
      expect(service.findOneById).toHaveBeenCalledWith(keywordRecordId);
      expect(result.read_at).toBeDefined();
    });
  });
  describe('saveScrapingData', () => {
    it('should save scraping data for a keyword record', async () => {
      const keywordRecordId = 1;
      const data = {
        id: keywordRecordId,
        keyword: 'example',
        total_advertisers: 10,
        total_links: 20,
        total_search_results: 'testing',
        save: jest.fn(),
        set: jest.fn(),
      };
      jest.spyOn(service, 'findOneById').mockImplementation((id) =>
        Promise.resolve({
          ...data,
          id,
        } as unknown as KeywordRecord),
      );
      await service.saveScrapingData(data as unknown as ScrapeJobDonePayload);
      expect(service.findOneById).toHaveBeenCalledWith(keywordRecordId);
      expect(data.set).toHaveBeenCalled();
      expect(data.save).toHaveBeenCalled();
    });
  });
  describe('prepareListDataQuery', () => {
    it('should prepare list data query with default values', () => {
      const queryDto = {} as KeywordRecordSearchQueryDto;
      const user = { id: 1 };
      const result = service['prepareListDataQuery'](queryDto, user);

      expect(result).toEqual({
        limit: 10,
        offset: 0,
        where: {
          user_id: user.id,
        },
      });
    });

    it('should prepare list data query with custom limit and page', () => {
      const queryDto: KeywordRecordSearchQueryDto = {
        limit: 20,
        page: 2,
      };
      const user = { id: 1 };
      const result = service['prepareListDataQuery'](queryDto, user);

      expect(result).toEqual({
        limit: queryDto.limit,
        offset: queryDto.page * queryDto.limit,
        where: {
          user_id: user.id,
        },
      });
    });

    it('should prepare list data query with search by keyword', () => {
      const queryDto = {
        keyword: 'example',
      } as KeywordRecordSearchQueryDto;
      const user = { id: 1 };
      const result = service['prepareListDataQuery'](queryDto, user);

      expect(result).toEqual({
        limit: 10,
        offset: 0,
        where: {
          user_id: user.id,
          keyword: { [Op.like]: `%${queryDto.keyword}%` },
        },
      });
    });

    it('should prepare list data query with search by search query', () => {
      const queryDto = {
        search: 'searchQuery',
      } as KeywordRecordSearchQueryDto;
      const user = { id: 1 };
      const result = service['prepareListDataQuery'](queryDto, user);

      expect(result).toEqual({
        limit: 10,
        offset: 0,
        where: {
          user_id: user.id,
          keyword: { [Op.like]: `%${queryDto.search}%` },
        },
      });
    });

    it('should prioritize keyword over search query in list data query', () => {
      const queryDto = {
        keyword: 'example',
        search: 'searchQuery',
      } as KeywordRecordSearchQueryDto;
      const user = { id: 1 };
      const result = service['prepareListDataQuery'](queryDto, user);

      expect(result).toEqual({
        limit: 10,
        offset: 0,
        where: {
          user_id: user.id,
          keyword: { [Op.like]: `%${queryDto.keyword}%` },
        },
      });
    });
  });
});
