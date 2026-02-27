import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DirectDebitSyncService } from './direct-debit-sync.service';

@Injectable()
export class DirectDebitSyncWorker {
    private readonly logger = new Logger(DirectDebitSyncWorker.name);

    constructor(private readonly directDebitSyncService: DirectDebitSyncService) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleDirectDebitSync() {
        try {
            await this.directDebitSyncService.syncDirectDebits();
        } catch (error) {
            this.logger.error('Failed to sync direct debits', error);
        }
    }
}
