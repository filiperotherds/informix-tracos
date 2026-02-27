import { Module } from '@nestjs/common';
import { MaterialModule } from '@/core/material/material.module';
import { ReservationSyncWorker } from './reservation-sync/reservation-sync.worker';
import { ReservationSyncService } from './reservation-sync/reservation-sync.service';
import { ItemSyncWorker } from './item-sync/item-sync.worker';
import { ItemSyncService } from './item-sync/item-sync.service';
import { CleanDirectDebitTempWorker } from './clean-direct-debit-temp/clean-direct-debit-temp.worker';
import { CleanDirectDebitTempService } from './clean-direct-debit-temp/clean-direct-debit-temp.service';
import { DirectDebitSyncWorker } from './direct-debit-sync/direct-debit-sync.worker';
import { DirectDebitSyncService } from './direct-debit-sync/direct-debit-sync.service';

@Module({
    imports: [
        MaterialModule,
    ],
    providers: [
        ReservationSyncWorker,
        ReservationSyncService,
        ItemSyncWorker,
        ItemSyncService,
        CleanDirectDebitTempWorker,
        CleanDirectDebitTempService,
        DirectDebitSyncWorker,
        DirectDebitSyncService,
    ],
})
export class JobsModule { }
