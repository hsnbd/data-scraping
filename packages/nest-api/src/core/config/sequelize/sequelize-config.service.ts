import { Inject, Injectable } from '@nestjs/common';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { AppEnvironment, ConfigKey } from '../app-config';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
  @Inject()
  private configService: ConfigService;

  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'postgres',
      host: this.configService.get<string>(ConfigKey.PGSQL_DB_HOST),
      port: this.configService.get<number>(ConfigKey.PGSQL_DB_PORT),
      username: this.configService.get<string>(ConfigKey.PGSQL_DB_USERNAME),
      password: this.configService.get<string>(ConfigKey.PGSQL_DB_PASSWORD),
      database: this.configService.get<string>(ConfigKey.PGSQL_DB_DATABASE),
      autoLoadModels: true,
      synchronize: true,
      logging: [AppEnvironment.LOCAL, AppEnvironment.STAGE].includes(
        this.configService.get(ConfigKey.APP_ENV),
      )
        ? console.log
        : false,
    };
  }
}
