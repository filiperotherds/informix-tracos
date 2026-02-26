import { Injectable, Logger } from '@nestjs/common';
import { XrefRepository } from '@/core/material/repositories/xref.repository';
import { TractianApiService } from '@/tractian-api/tractian-api.service';

@Injectable()
export class ItemSyncService {
    private readonly logger = new Logger(ItemSyncService.name);

    constructor(
        private readonly xrefRepository: XrefRepository,
        private readonly tractianApi: TractianApiService,
    ) { }

    async syncItems(companyId: string): Promise<void> {
        this.logger.log('Starting item cross-reference sync');

        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const inventory = await this.tractianApi.getInventoryByCompanyId({
                id: companyId,
                limit: 100,
                page,
            });

            for (const item of inventory.data) {
                await this.xrefRepository.upsertXrefItem(
                    item.id,
                    item.code.value,
                    item.disabled.value,
                );
            }

            hasNextPage = inventory.hasNextPage;
            page++;
        }

        this.logger.log('Item cross-reference sync completed');
    }
}
