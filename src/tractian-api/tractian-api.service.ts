import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/env';
import ky, { type KyInstance } from 'ky';
import { GetInventoryByCompanyIdResponse } from './schemas/get-inventory-by-company-id-response';
import { GetItemStorageResponse } from './schemas/get-item-storage-response';

interface WithdrawItemReservationRequest {
    withdrawnPositions: {
        itemReservationId: string;
        storageId: string;
        storageName: string;
        quantity: number;
    }[];
    withdrawnBatches: {
        itemReservationId: string;
        inboundBatchId: string;
        inboundBatchName: string;
        quantity: number;
    }[];
    id: string;
}

interface WithdrawItemReservationResponse {
    withdrawnBatches: any[];
    withdrawnPositions: any[];
    id: string;
    number: number;
    companyId: string;
}

interface GetInventoryByCompanyIdRequest {
    id: string;
    limit: number;
    page: number;
}

interface GetItemStorageRequest {
    id: string;
}

@Injectable()
export class TractianApiService {
    private readonly logger = new Logger(TractianApiService.name);
    private api: KyInstance;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService<Env, true>,
    ) {
        const apiUrl = this.config.get('TRACKIAN_API_URL', { infer: true });

        this.api = ky.create({
            prefixUrl: apiUrl,
            hooks: {
                beforeRequest: [
                    async (request) => {
                        const token = await this.getTracosToken();
                        request.headers.set('Authorization', `Bearer ${token}`);
                    }
                ]
            }
        });
    }

    private async getTracosToken(): Promise<string> {
        const response = await this.prisma.tracosToken.findFirst({
            select: {
                token: true
            }
        });

        if (!response) {
            throw new Error('Token not found.');
        }

        return response.token;
    }

    async getInventoryByCompanyId({
        id,
        limit,
        page
    }: GetInventoryByCompanyIdRequest): Promise<GetInventoryByCompanyIdResponse> {
        const result = await this.api
            .get(`supply/companies/${id}/inventory?limit=${limit}&page=${page}`)
            .json<GetInventoryByCompanyIdResponse>();

        return result;
    }

    async getItemStorage({
        id,
    }: GetItemStorageRequest): Promise<GetItemStorageResponse> {
        const result = await this.api
            .get(`item-storage/item-id/${id}`)
            .json<GetItemStorageResponse>();

        return result;
    }

    async withdrawItemReservation({
        id,
        withdrawnPositions,
        withdrawnBatches
    }: WithdrawItemReservationRequest): Promise<WithdrawItemReservationResponse> {
        const result = await this.api
            .post('supply/item-reservation/withdraw', {
                json: [
                    {
                        withdrawnPositions,
                        withdrawnBatches,
                        id
                    }
                ],
            })
            .json<WithdrawItemReservationResponse>();

        return result;
    }
}
