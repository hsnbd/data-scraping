import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, ConfigKey } from '../core/config/app-config';
import { ScrapingModule } from './scraping.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot(appConfig),
  );
  const configService = appContext.get<ConfigService>(ConfigService);

  const app = await NestFactory.createMicroservice(ScrapingModule, {
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>(ConfigKey.RMQ_URL)],
      queue: configService.get<string>(ConfigKey.RMQ_SENDING_QUEUE),
      retryDelay: 100,
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();

  await appContext.close();
}

bootstrap();
