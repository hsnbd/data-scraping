import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigKey } from './core/config/app-config';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { AllExceptionsFilter } from './core/exception-filters/all-exceptions.filter';
import { setupSwagger } from './core/lib/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>(ConfigKey.RMQ_URL)],
      queue: configService.get<string>(ConfigKey.RMQ_RECEIVING_QUEUE),
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 5,
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  app.use(helmet());

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  setupSwagger(app).catch(console.log);

  await app.startAllMicroservices();
  await app.listen(configService.get<number>(ConfigKey.PORT));

  console.log(
    `App running on ${await app.getUrl()} (ENV: ${configService.get<string>(
      ConfigKey.APP_ENV,
    )})`,
  );
}

bootstrap().catch((error) => console.log(error));
