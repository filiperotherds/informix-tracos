import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanDirectDebitTempService } from './clean-direct-debit-temp.service';

@Injectable()
export class CleanDirectDebitTempWorker {
    private readonly logger = new Logger(CleanDirectDebitTempWorker.name);

    constructor(private readonly cleanDirectDebitTempService: CleanDirectDebitTempService) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCleanDirectDebitTemp() {
        try {
            await this.cleanDirectDebitTempService.cleanDirectDebitTemp();
        } catch (error) {
            this.logger.error('Failed to clean direct debits', error);
        }
    }
}
