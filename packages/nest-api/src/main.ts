import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigKey } from './core/config/app-config';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService: ConfigService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>(ConfigKey.PORT));

  console.log(
    `App running on ${await app.getUrl()} (ENV: ${configService.get<string>(
      ConfigKey.APP_ENV,
    )})`,
  );
}
bootstrap();
