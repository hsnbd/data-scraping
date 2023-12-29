import { ConfigService } from '@nestjs/config';
import { ClientProvider, Transport } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { ClientsModuleOptionsFactory } from '@nestjs/microservices/module/interfaces/clients-module.interface';
import { ConfigKey } from '../app-config';

@Injectable()
export class RmqScrapingDoneConfigService
  implements ClientsModuleOptionsFactory
{
  @Inject()
  private configService: ConfigService;

  createClientOptions(): Promise<ClientProvider> | ClientProvider {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>(ConfigKey.RMQ_URL)],
        queue: this.configService.get<string>(ConfigKey.RMQ_RECEIVING_QUEUE),
        queueOptions: {
          durable: true,
        },
      },
    };
  }
}
