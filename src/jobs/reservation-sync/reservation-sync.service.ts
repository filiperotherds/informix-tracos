import { Injectable, Logger } from '@nestjs/common';
import { InformixService, InformixConnection } from '@/informix/informix.service';
import { ReservationRepository } from '@/core/material/repositories/reservation.repository';
import { XrefRepository } from '@/core/material/repositories/xref.repository';
import { TractianApiService } from '@/tractian-api/tractian-api.service';
import { WithdrawnBatch, WithdrawnPosition } from '@/tractian-api/schemas/withdraw-item-reservation-response';

interface PendingReservation {
    logixId: string;
    tracosId: string;
}

interface ReservationData {
    cod_empresa: string;
    cod_item: string;
    old_value: number;
    num_os: string;
}

@Injectable()
export class ReservationSyncService {
    private readonly logger = new Logger(ReservationSyncService.name);

    constructor(
        private readonly informix: InformixService,
        private readonly reservationRepository: ReservationRepository,
        private readonly xrefRepository: XrefRepository,
        private readonly tractianApi: TractianApiService,
    ) { }

    async syncPendingReservations(): Promise<void> {
        const pendingRequests = await this.xrefRepository.getPendingRequests();

        if (!pendingRequests || pendingRequests.length === 0) {
            return;
        }

        this.logger.log(`Found ${pendingRequests.length} pending reservation(s) to sync`);

        for (const req of pendingRequests) {
            try {
                await this.processReservation(req);
            } catch (err) {
                this.logger.error(`Failed to process reservation ${req.logixId}`, err);
            }
        }
    }

    private async processReservation(req: PendingReservation): Promise<void> {
        const status = await this.getReservationStatus(req.logixId);

        this.logger.debug(`Reservation ${req.logixId} status: ${status}`);

        if (status === 'L') {
            await this.processReleasedReservation(req);
        }
    }

    private async getReservationStatus(logixId: string): Promise<string | null> {
        return this.informix.transaction<string | null>(async (connection) => {
            await connection.query('SET ISOLATION DIRTY READ;');

            const result = await connection.query<{ ies_situacao: string }>(
                'SELECT ies_situacao FROM estoque_loc_reser WHERE num_reserva = ?',
                [logixId],
            );

            return result.length > 0 ? result[0].ies_situacao : null;
        });
    }

    private async processReleasedReservation(req: PendingReservation): Promise<void> {
        await this.xrefRepository.updateReservationStatus(req.logixId, 'LIBERADA');

        const reserveData = await this.fetchReserveData(Number(req.logixId));

        const xrefItem = await this.xrefRepository.getXrefItemByLogixId(reserveData.cod_item);

        if (!xrefItem) {
            throw new Error(`Xref item not found for cod_item: ${reserveData.cod_item}`);
        }

        const itemStorage = await this.tractianApi.getItemStorage({ id: xrefItem.tracosId });
        const storageData = itemStorage.data[0];

        const withdrawnPositions = this.buildWithdrawnPositions(req.tracosId, storageData, reserveData.old_value);
        const withdrawnBatches = this.buildWithdrawnBatches(req.tracosId, storageData.inboundBatches, reserveData.old_value);

        await this.tractianApi.withdrawItemReservation({
            id: req.tracosId,
            withdrawnPositions,
            withdrawnBatches,
        });

        this.logger.log(`Withdrawal completed for reservation ${req.tracosId}`);
    }

    private async fetchReserveData(logixId: number): Promise<ReservationData> {
        return this.informix.transaction<ReservationData>(async (connection) => {
            await connection.query('SET ISOLATION DIRTY READ;');

            const data = await this.reservationRepository.getEstoqueLocReserData({ logixId }, connection);

            if (!data) {
                throw new Error('Reserve data not found.');
            }

            return data;
        });
    }

    private buildWithdrawnPositions(
        tracosId: string,
        storageData: { storageId: string; storageName: string },
        quantity: number,
    ): WithdrawnPosition[] {
        return [
            {
                itemReservationId: tracosId,
                storageId: storageData.storageId,
                storageName: storageData.storageName,
                quantity,
            },
        ];
    }

    private buildWithdrawnBatches(
        tracosId: string,
        inboundBatches: { inboundBatchId: string; inboundBatchName: string; quantity: number; inboundBatchEntryDate: string }[],
        totalQuantity: number,
    ): WithdrawnBatch[] {
        const sortedBatches = [...inboundBatches].sort(
            (a, b) => new Date(a.inboundBatchEntryDate).getTime() - new Date(b.inboundBatchEntryDate).getTime(),
        );

        const withdrawnBatches: WithdrawnBatch[] = [];
        let remainingQuantity = totalQuantity;

        for (const batch of sortedBatches) {
            if (remainingQuantity <= 0) break;

            const amountToWithdraw = Math.min(batch.quantity, remainingQuantity);

            withdrawnBatches.push({
                itemReservationId: tracosId,
                inboundBatchId: batch.inboundBatchId,
                inboundBatchName: batch.inboundBatchName,
                quantity: amountToWithdraw,
            });

            remainingQuantity -= amountToWithdraw;
        }

        return withdrawnBatches;
    }
}
