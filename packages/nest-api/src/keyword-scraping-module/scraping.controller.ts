import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqMessagePatterns } from '../core/enums';
import { ScrapeKeywordPayload } from '../core/types';

@Controller()
export class ScrapingController {
  @EventPattern(RmqMessagePatterns.SCRAPE_KEYWORD)
  async scrapeKeyword(
    @Payload() data: ScrapeKeywordPayload,
    @Ctx() context: RmqContext,
  ) {
    console.log(RmqMessagePatterns.SCRAPE_KEYWORD, data, context);
  }
}
