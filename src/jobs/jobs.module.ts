import { Module } from '@nestjs/common';
import { MaterialModule } from '@/core/material/material.module';
import { XrefReservationSyncWorker } from './xref-reservation-sync.worker';
import { XrefItemSyncWorker } from './xref-item-sync.worker';

@Module({
    imports: [
        MaterialModule,
    ],
    providers: [
        XrefReservationSyncWorker,
        XrefItemSyncWorker,
    ],
})
export class JobsModule { }
