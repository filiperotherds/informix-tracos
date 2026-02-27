import { InformixService } from "@/informix/informix.service";
import { PrismaService } from "@/prisma/prisma.service";
import { TractianApiService } from "@/tractian-api/tractian-api.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DirectDebitSyncService {
    private readonly logger = new Logger(DirectDebitSyncService.name);

    constructor(
        private readonly informix: InformixService,
        private readonly prisma: PrismaService,
        private readonly tractianApi: TractianApiService,
    ) { }

    async syncDirectDebits() {
        const directDebits = await this.informix.transaction(async (connection) => {
            await connection.query('SET ISOLATION DIRTY READ;');

            return
        });
    }
}