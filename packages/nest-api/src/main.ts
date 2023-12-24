import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigKey } from './core/config/app-config';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { AllExceptionsFilter } from './core/exception-filters/all-exceptions.filter';
import { setupSwagger } from './core/lib/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.use(helmet());

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  setupSwagger(app).catch(console.log);

  await app.listen(configService.get<number>(ConfigKey.PORT));

  console.log(
    `App running on ${await app.getUrl()} (ENV: ${configService.get<string>(
      ConfigKey.APP_ENV,
    )})`,
  );
}

bootstrap().catch((error) => console.log(error));
