import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { XrefRepository } from '@/core/material/repositories/xref.repository';
import { ItemSyncService } from './item-sync.service';

@Injectable()
export class ItemSyncWorker {
    private readonly logger = new Logger(ItemSyncWorker.name);

    constructor(
        private readonly xrefRepository: XrefRepository,
        private readonly itemSyncService: ItemSyncService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async handleItemSync() {
        try {
            const companyId = await this.xrefRepository.getCompanyId('HML');

            if (!companyId) {
                this.logger.error('No company found for item sync');
                return;
            }

            await this.itemSyncService.syncItems(companyId);
        } catch (error) {
            this.logger.error('Failed to sync items', error);
        }
    }
}
