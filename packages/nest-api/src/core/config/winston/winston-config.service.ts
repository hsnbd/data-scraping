import { Inject, Injectable } from '@nestjs/common';
import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston/dist/winston.interfaces';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AppEnvironment, ConfigKey } from '../app-config';
import * as dayjs from 'dayjs';

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  @Inject()
  private configService: ConfigService;

  createWinstonModuleOptions():
    | Promise<WinstonModuleOptions>
    | WinstonModuleOptions {
    const removeRouterLog = winston.format((info) => {
      if (
        ['RoutesResolver', 'RouterExplorer', 'NestApplication'].includes(
          info.context,
        )
      ) {
        return false;
      }
      return info;
    });

    const transports: any = [
      new winston.transports.DailyRotateFile({
        // %DATE will be replaced by the current date
        filename: `logs/logs-%DATE%.log`,
        format: winston.format.combine(
          removeRouterLog(),
          winston.format.json(),
        ),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false, // don't want to zip our logs
        maxFiles: '30d', // will keep log until they are older than 30 days
      }),
    ];

    if (
      this.configService.get<string>(ConfigKey.APP_ENV) !== AppEnvironment.PROD
    ) {
      transports.push(
        new winston.transports.Console({
          level: 'silly', // silly or lesser then silly
          format: winston.format.combine(
            winston.format.cli(),
            winston.format.splat(),
            winston.format.timestamp(),
            winston.format.printf((info) => {
              return `${dayjs(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${
                info.level
              }: ${info.message} ${info?.stack || ''}`;
            }),
          ),
        }),
      );
    }

    return {
      exitOnError: true,
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      ],
      handleExceptions: true,
      handleRejections: true,
      transports: [...transports],
    };
  }
}
