import { Module } from '@nestjs/common';
import { MaterialModule } from '@/core/material/material.module';
import { ReservationSyncWorker } from './reservation-sync/reservation-sync.worker';
import { ReservationSyncService } from './reservation-sync/reservation-sync.service';
import { ItemSyncWorker } from './item-sync/item-sync.worker';
import { ItemSyncService } from './item-sync/item-sync.service';

@Module({
    imports: [
        MaterialModule,
    ],
    providers: [
        ReservationSyncWorker,
        ReservationSyncService,
        ItemSyncWorker,
        ItemSyncService,
    ],
})
export class JobsModule { }
