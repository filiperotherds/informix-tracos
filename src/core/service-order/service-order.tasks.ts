import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServiceOrderService } from './service-order.service';

@Injectable()
export class ServiceOrderTasksService {
  private readonly logger = new Logger(ServiceOrderTasksService.name);

  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Executando task agendada do Service Order...');

    try {
      
    } catch (error) {
      this.logger.error('Erro ao executar task agendada', error);
    }
  }
}