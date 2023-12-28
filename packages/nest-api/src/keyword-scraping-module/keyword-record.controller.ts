import {
  Controller,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { KeywordRecordSearchQueryDto } from './dto/keyword-record-search-query.dto';
import { KeywordRecordService } from './services/keyword-record.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqMessagePatterns } from '../core/enums';
import { ScrapeJobDonePayload } from '../core/types';
import { JwtAuthGuard } from '../auth-module/guards/jwt-auth.guard';

@ApiTags('keyword-scraping')
@Controller()
export class KeywordRecordController {
  @Inject()
  private readonly keywordRecordService: KeywordRecordService;

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('keyword-records')
  listAllKeywordRecords(
    @Request() req: any,
    @Query() queryDto: KeywordRecordSearchQueryDto,
  ) {
    return this.keywordRecordService.getListData(queryDto, req.user);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post('keyword-records')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadKeywordRecords(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000 }),
          new FileTypeValidator({
            fileType: /(text\/csv|application\/vnd.ms-excel)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    const keywords = await this.keywordRecordService.processCsvFile(file);

    return await this.keywordRecordService.processKeywords(req.user, keywords);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get('keyword-records/:id')
  singleKeywordRecord(@Param('id', ParseIntPipe) id: number) {
    return this.keywordRecordService.findOneById(id);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Patch('keyword-records/:id/mark-as-read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.keywordRecordService.markAsRead(id);
  }

  @EventPattern(RmqMessagePatterns.SCRAPING_JOB_DONE)
  async scrapingJobDone(
    @Payload() data: ScrapeJobDonePayload,
    @Ctx() context: RmqContext,
  ) {
    console.log(RmqMessagePatterns.SCRAPING_JOB_DONE, data, context);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.keywordRecordService.saveScrapingData(data);
      channel.ack(originalMsg);
      console.log('done', RmqMessagePatterns.SCRAPING_JOB_DONE, data.keyword);
    } catch (e) {
      channel.nack(originalMsg, false, true);
      console.log('eeee', e);
    }
  }
}
