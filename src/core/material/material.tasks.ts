import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MaterialService } from './material.service';

@Injectable()
export class MaterialTasksService {
    private readonly logger = new Logger(MaterialTasksService.name);

    constructor(private readonly materialService: MaterialService) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron() {
        this.logger.debug('Executando task agendada do Service Order...');

        try {

        } catch (error) {
            this.logger.error('Erro ao executar task agendada', error);
        }
    }
}