import { InformixService } from "@/informix/informix.service";
import { PrismaService } from "@/prisma/prisma.service";
import { TractianApiService } from "@/tractian-api/tractian-api.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CleanDirectDebitTempService {
    private readonly logger = new Logger(CleanDirectDebitTempService.name);

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async cleanDirectDebitTemp() {
        await this.prisma.directDebitTemp.deleteMany({
            where: {
                createdAt: {
                    lt: new Date(Date.now() - 48 * 60 * 60 * 1000),
                },
            },
        });
    }
}