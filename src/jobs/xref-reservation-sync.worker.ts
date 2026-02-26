import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InformixService } from '../informix/informix.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MaterialRepository } from '@/core/material/material.repository';
import { TractianApiService } from '@/tractian-api/tractian-api.service';

@Injectable()
export class XrefReservationSyncWorker {
    private readonly logger = new Logger(XrefReservationSyncWorker.name);

    constructor(
        private readonly informix: InformixService,
        private readonly prisma: PrismaService,
        private readonly materialRepository: MaterialRepository,
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

            this.logger.log(pendingRequests)

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

                    this.logger.log(reqStatus)

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

                            const reserveData = await this.informix.transaction<any>(async (connection) => {
                                await connection.query('SET ISOLATION DIRTY READ;')

                                const data = await this.materialRepository.getEstoqueLocReserData({
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

                            // Lógica para obter os itens dos Batches e o Storage Position

                            const withdrawnPositions = [
                                {
                                    itemReservationId: req.tracosId,
                                    storageId: itemStorageResponse.data[0].storageId,
                                    storageName: itemStorageResponse.data[0].storageName,
                                    quantity: reserveData.old_value
                                }
                            ]

                            let remainingQtd = reserveData.old_value

                            let withdrawnBatches: any[] = []

                            const batches = itemStorageResponse.data[0].inboundBatches;

                            batches.sort((a, b) => {
                                return new Date(a.inboundBatchEntryDate).getTime() - new Date(b.inboundBatchEntryDate).getTime();
                            });

                            batches.forEach((batch) => {
                                if (remainingQtd <= 0) {
                                    return;
                                }

                                const storageInfo = itemStorageResponse.data[0];
                                const amountToWithdraw = Math.min(batch.quantity, remainingQtd);

                                withdrawnBatches.push({
                                    itemReservationId: req.tracosId,
                                    inboundBatchId: batch.inboundBatchId,
                                    inboundBatchName: batch.inboundBatchName,
                                    quantity: amountToWithdraw,
                                });

                                remainingQtd -= amountToWithdraw;
                            });

                            const withdrawResult = await this.tractianApi.withdrawItemReservation({
                                id: req.tracosId,
                                withdrawnPositions,
                                withdrawnBatches
                            })

                            this.logger.log(withdrawResult)

                        }
                    }
                } catch (err) {
                    this.logger.log(err)
                }
            }
        } catch (error) {
            this.logger.error(`Falha na consulta ao Informix: ${error}`);
        }
    }
}