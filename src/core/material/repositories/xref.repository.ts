import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateDeParaSchema } from '../schemas/de-para/create-de-para.schema';
import { DeleteDeParaSchema } from '../schemas/de-para/delete-de-para.schema';

@Injectable()
export class XrefRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createDeParaId({ logixId, tracosId }: CreateDeParaSchema) {
        await this.prisma.xrefReservation.create({
            data: {
                logixId,
                tracosId,
                status: 'PENDENTE',
            },
        });
    }

    async cancelDeParaId({ tracosId }: DeleteDeParaSchema) {
        await this.prisma.xrefReservation.updateMany({
            where: {
                tracosId,
            },
            data: {
                status: 'CANCELADA',
            },
        });
    }

    async getPendingRequests() {
        const pendingRequests = await this.prisma.xrefReservation.findMany({
            where: {
                status: 'PENDENTE',
            },
        });

        return pendingRequests;
    }

    async getLogixId(tracosId: string) {
        const result = await this.prisma.xrefReservation.findFirst({
            where: {
                tracosId,
            },
            select: {
                logixId: true,
            },
        });

        if (!result) {
            throw new BadRequestException('Requisition ID not found.');
        }

        return Number(result.logixId);
    }

    async getNumTransac(tracos_id: string) {
        const response = await this.prisma.xrefReservation.findFirst({
            select: {
                logixId: true,
            },
            where: {
                tracosId: tracos_id,
            },
        });

        if (!response) {
            throw new BadRequestException('No values found.');
        }

        return Number(response.logixId);
    }
}
