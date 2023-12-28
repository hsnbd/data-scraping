import { Controller, Inject } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqMessagePatterns } from '../core/enums';
import { ScrapeKeywordPayload } from '../core/types';
import { KeywordScrapeService } from './keyword-scrape.service';

@Controller()
export class ScrapingController {
  @Inject()
  private readonly keywordScrapeService: KeywordScrapeService;

  @EventPattern(RmqMessagePatterns.SCRAPE_KEYWORD)
  async scrapeKeyword(
    @Payload() data: ScrapeKeywordPayload,
    @Ctx() context: RmqContext,
  ) {
    console.log(RmqMessagePatterns.SCRAPE_KEYWORD, data, context);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const result = await this.keywordScrapeService.scrapeKeyword(data);
      console.log('result', result);
      this.keywordScrapeService.notifyScrapingDoneStatus(result);
      channel.ack(originalMsg);
    } catch (e) {
      channel.nack(originalMsg, false, true);
      console.log('eeee', e);
    }
  }
}
