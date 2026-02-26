import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationSyncService } from './reservation-sync.service';

@Injectable()
export class ReservationSyncWorker {
    private readonly logger = new Logger(ReservationSyncWorker.name);

    constructor(private readonly reservationSyncService: ReservationSyncService) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleReservationSync() {
        try {
            await this.reservationSyncService.syncPendingReservations();
        } catch (error) {
            this.logger.error('Failed to sync reservations', error);
        }
    }
}
