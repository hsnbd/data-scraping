import * as JOI from 'joi';

export const appConfig = {
  isGlobal: true,
  validationSchema: JOI.object({
    PORT: JOI.number().required(),
    APP_ENV: JOI.string().required(),
  }),
};

export enum ConfigKey {
  PORT = 'PORT',
  APP_ENV = 'APP_ENV',
}

export enum AppEnvironment {
  LOCAL = 'LOCAL',
  STAGE = 'DEV',
  TESTING = 'TESTING',
  PROD = 'PRODUCTION',
}
