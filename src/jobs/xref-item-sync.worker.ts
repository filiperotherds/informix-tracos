import { PrismaService } from "@/prisma/prisma.service";
import { TractianApiService } from "@/tractian-api/tractian-api.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class XrefItemSyncWorker {
    private readonly logger = new Logger(XrefItemSyncWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly tractianApi: TractianApiService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async handleXrefItemSync() {
        this.logger.log('XrefItemSyncWorker executed')

        let page = 1
        let hasNextPage = true

        const tokenResponse = await this.prisma.tracosToken.findFirst({
            select: {
                companyId: true
            },
            where: {
                environment: 'HML'
            }
        })

        if (!tokenResponse) {
            this.logger.error('Nenhuma empresa encontrada')
            return
        }

        const { companyId } = tokenResponse

        while (hasNextPage) {
            const inventory = await this.tractianApi.getInventoryByCompanyId({
                id: companyId,
                limit: 100,
                page
            })

            for (const item of inventory.data) {
                const xrefItem = await this.prisma.xrefItem.findUnique({
                    where: {
                        tracosId: item.id
                    }
                })

                if (!xrefItem) {
                    await this.prisma.xrefItem.create({
                        data: {
                            tracosId: item.id,
                            logixId: item.code.value,
                            disabled: item.disabled.value
                        }
                    })
                }

                if (xrefItem?.disabled !== item.disabled.value) {
                    await this.prisma.xrefItem.update({
                        data: {
                            disabled: item.disabled.value
                        },
                        where: {
                            tracosId: item.id
                        }
                    })
                }
            }

            hasNextPage = inventory.hasNextPage

            page++
        }
    }
}
