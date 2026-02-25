import { Module } from '@nestjs/common';
import { InformixService } from '../informix/informix.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MaterialRepository } from '@/core/material/material.repository';
import { XrefReservationSyncWorker } from './xref-reservation-sync.worker';
import { XrefItemSyncWorker } from './xref-item-sync.worker';

@Module({
    providers: [
        InformixService,
        PrismaService,
        MaterialRepository,
        XrefReservationSyncWorker,
        XrefItemSyncWorker,
    ],
})
export class JobsModule { }
