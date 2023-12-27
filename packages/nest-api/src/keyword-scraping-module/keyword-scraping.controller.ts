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
  Put,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-module/guards/jwt-auth.guard';
import { KeywordRecordSearchQueryDto } from './dto/keyword-record-search-query.dto';
import { KeywordScrapingService } from './services/keyword-scraping.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('keyword-scraping')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
@Controller()
export class KeywordScrapingController {
  @Inject()
  private readonly keywordScrapingService: KeywordScrapingService;

  @Get('keyword-records')
  listAllKeywordRecords(
    @Request() req: any,
    @Query() queryDto: KeywordRecordSearchQueryDto,
  ) {
    return this.keywordScrapingService.getListData(queryDto);
  }

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
    const keywords = await this.keywordScrapingService.processCsvFile(file);

    return await this.keywordScrapingService.scrapKeywords(req.user, keywords);
  }

  @Get('keyword-records/:id')
  singleKeywordRecord(@Param('id', ParseIntPipe) id: number) {
    return this.keywordScrapingService.findOneById(id);
  }

  @Patch('keyword-records/:id/mark-as-read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.keywordScrapingService.markAsRead(id);
  }
}
