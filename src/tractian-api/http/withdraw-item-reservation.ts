import { api } from "../api-client";

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

type WithdrawItemReservationResponse = {
    withdrawnBatches: any[],
    withdrawnPositions: any[],
    id: string,
    number: number,
    companyId: string
}

export async function withdrawItemReservation({
    id,
    withdrawnPositions,
    withdrawnBatches
}: WithdrawItemReservationRequest) {
    const result = await api.post('supply/item-reservation/withdraw', {
        json: [
            {
                withdrawnPositions: withdrawnPositions,
                withdrawnBatches: withdrawnBatches,
                id: id
            }
        ],
    }).json<WithdrawItemReservationResponse>()

    return result
}