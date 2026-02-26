import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateXrefSchema } from '../schemas/xref/create-xref.schema';
import { DeleteXrefSchema } from '../schemas/xref/delete-xref.schema';

@Injectable()
export class XrefRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createXref({ logixId, tracosId }: CreateXrefSchema) {
        await this.prisma.xrefReservation.create({
            data: {
                logixId,
                tracosId,
                status: 'PENDENTE',
            },
        });
    }

    async cancelXref({ tracosId }: DeleteXrefSchema) {
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

    async updateReservationStatus(logixId: string, status: string) {
        await this.prisma.xrefReservation.update({
            where: { logixId },
            data: { status },
        });
    }

    async getXrefItemByLogixId(logixId: string) {
        return this.prisma.xrefItem.findUnique({
            where: { logixId },
            select: { tracosId: true },
        });
    }

    async getCompanyId(environment: string): Promise<string | null> {
        const result = await this.prisma.tracosToken.findFirst({
            select: { companyId: true },
            where: { environment },
        });

        return result?.companyId ?? null;
    }

    async upsertXrefItem(tracosId: string, logixId: string, disabled: boolean) {
        await this.prisma.xrefItem.upsert({
            where: { tracosId },
            create: { tracosId, logixId, disabled },
            update: { disabled },
        });
    }
}
