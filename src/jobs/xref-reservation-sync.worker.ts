import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InformixService } from '../informix/informix.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ReservationRepository } from '@/core/material/repositories/reservation.repository';
import { TractianApiService } from '@/tractian-api/tractian-api.service';
import { WithdrawnBatch } from '@/tractian-api/schemas/withdraw-item-reservation-response';

@Injectable()
export class XrefReservationSyncWorker {
    private readonly logger = new Logger(XrefReservationSyncWorker.name);

    constructor(
        private readonly informix: InformixService,
        private readonly prisma: PrismaService,
        private readonly reservationRepository: ReservationRepository,
        private readonly tractianApi: TractianApiService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleItemReservationSync() {
        try {
            const pendingRequests = await this.prisma.xrefReservation.findMany({
                select: {
                    logixId: true,
                    tracosId: true,
                },
                where: {
                    status: 'PENDENTE'
                }
            })

            if (!pendingRequests || pendingRequests.length === 0) {
                return
            }

            this.logger.log(`Found ${pendingRequests.length} pending reservation(s) to sync`);

            for (const req of pendingRequests) {
                try {
                    const reqStatus = await this.informix.transaction<string | null>(async (connection) => {
                        await connection.query('SET ISOLATION DIRTY READ;')

                        const result = await connection.query(`SELECT ies_situacao FROM estoque_loc_reser WHERE num_reserva = ${req.logixId}`)

                        if (Array.isArray(result) && result.length > 0) {
                            const row = result[0] as { ies_situacao: string };
                            return row.ies_situacao;
                        }

                        return null;
                    })

                    this.logger.debug(`Reservation ${req.logixId} status: ${reqStatus}`);

                    if (reqStatus) {
                        if (reqStatus === 'L') {

                            await this.prisma.xrefReservation.update({
                                where: {
                                    logixId: req.logixId
                                },
                                data: {
                                    status: 'LIBERADA'
                                }
                            })

                            const reserveData = await this.informix.transaction<{ cod_empresa: string; cod_item: string; old_value: number; num_os: string }>(async (connection) => {
                                await connection.query('SET ISOLATION DIRTY READ;')

                                const data = await this.reservationRepository.getEstoqueLocReserData({
                                    logixId: Number(req.logixId)
                                }, connection)

                                if (!data) {
                                    throw new Error('Reserve data not found.')
                                }

                                return data
                            })

                            const xrefItemResponse = await this.prisma.xrefItem.findUnique({
                                where: {
                                    logixId: reserveData.cod_item
                                },
                                select: {
                                    tracosId: true
                                }
                            })

                            if (!xrefItemResponse) {
                                throw new Error('Xref Item not found.')
                            }

                            const itemStorageResponse = await this.tractianApi.getItemStorage({
                                id: xrefItemResponse.tracosId
                            })

                            // Resolve batch items and storage position for withdrawal

                            const withdrawnPositions = [
                                {
                                    itemReservationId: req.tracosId,
                                    storageId: itemStorageResponse.data[0].storageId,
                                    storageName: itemStorageResponse.data[0].storageName,
                                    quantity: reserveData.old_value
                                }
                            ]

                            let remainingQuantity = reserveData.old_value

                            let withdrawnBatches: WithdrawnBatch[] = []

                            const batches = itemStorageResponse.data[0].inboundBatches;

                            batches.sort((a, b) => {
                                return new Date(a.inboundBatchEntryDate).getTime() - new Date(b.inboundBatchEntryDate).getTime();
                            });

                            batches.forEach((batch) => {
                                if (remainingQuantity <= 0) {
                                    return;
                                }

                                const storageInfo = itemStorageResponse.data[0];
                                const amountToWithdraw = Math.min(batch.quantity, remainingQuantity);

                                withdrawnBatches.push({
                                    itemReservationId: req.tracosId,
                                    inboundBatchId: batch.inboundBatchId,
                                    inboundBatchName: batch.inboundBatchName,
                                    quantity: amountToWithdraw,
                                });

                                remainingQuantity -= amountToWithdraw;
                            });

                            const withdrawResult = await this.tractianApi.withdrawItemReservation({
                                id: req.tracosId,
                                withdrawnPositions,
                                withdrawnBatches
                            })

                            this.logger.log(`Withdrawal completed for reservation ${req.tracosId}`);

                        }
                    }
                } catch (err) {
                    this.logger.error(`Failed to process reservation ${req.logixId}`, err);
                }
            }
        } catch (error) {
            this.logger.error(`Failed to query Informix: ${error}`);
        }
    }
}