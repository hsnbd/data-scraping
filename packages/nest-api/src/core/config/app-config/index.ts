import * as JOI from 'joi';

export const appConfig = {
  isGlobal: true,
  validationSchema: JOI.object({
    PORT: JOI.number().required(),
    APP_ENV: JOI.string().required(),
    PGSQL_DB_HOST: JOI.string().required(),
    PGSQL_DB_PORT: JOI.string().required(),
    PGSQL_DB_USERNAME: JOI.string().required(),
    PGSQL_DB_PASSWORD: JOI.string().required(),
    PGSQL_DB_DATABASE: JOI.string().required(),
    JWT_SECRET: JOI.string().required(),
  }),
};

export enum ConfigKey {
  PORT = 'PORT',
  APP_ENV = 'APP_ENV',
  PGSQL_DB_HOST = 'PGSQL_DB_HOST',
  PGSQL_DB_PORT = 'PGSQL_DB_PORT',
  PGSQL_DB_USERNAME = 'PGSQL_DB_USERNAME',
  PGSQL_DB_PASSWORD = 'PGSQL_DB_PASSWORD',
  PGSQL_DB_DATABASE = 'PGSQL_DB_DATABASE',
  JWT_SECRET = 'JWT_SECRET',
  RMQ_URL = 'RMQ_URL',
  RMQ_SENDING_QUEUE = 'RMQ_SENDING_QUEUE',
  RMQ_RECEIVING_QUEUE = 'RMQ_RECEIVING_QUEUE',
}

export enum AppEnvironment {
  LOCAL = 'LOCAL',
  STAGE = 'DEV',
  TESTING = 'TESTING',
  PROD = 'PRODUCTION',
}
