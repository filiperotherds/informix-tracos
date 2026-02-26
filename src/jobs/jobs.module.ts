import { Module } from '@nestjs/common';
import { MaterialRepository } from '@/core/material/material.repository';
import { XrefReservationSyncWorker } from './xref-reservation-sync.worker';
import { XrefItemSyncWorker } from './xref-item-sync.worker';

@Module({
    providers: [
        MaterialRepository,
        XrefReservationSyncWorker,
        XrefItemSyncWorker,
    ],
})
export class JobsModule { }
