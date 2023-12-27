import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, ConfigKey } from './core/config/app-config';
import { AppModule } from './app.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot(appConfig),
  );
  const configService = appContext.get<ConfigService>(ConfigService);

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>(ConfigKey.RMQ_URL)],
      queue: configService.get<string>(ConfigKey.RMQ_QUEUE),
      prefetchCount: 5,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();

  await appContext.close();
}

bootstrap();
