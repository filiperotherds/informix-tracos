import { z } from 'zod';

export const WithdrawnPositionSchema = z.object({
    itemReservationId: z.string(),
    storageId: z.string(),
    storageName: z.string(),
    quantity: z.number(),
});

export const WithdrawnBatchSchema = z.object({
    itemReservationId: z.string(),
    inboundBatchId: z.string(),
    inboundBatchName: z.string(),
    quantity: z.number(),
});

export const WithdrawItemReservationResponseSchema = z.object({
    withdrawnBatches: z.array(WithdrawnBatchSchema),
    withdrawnPositions: z.array(WithdrawnPositionSchema),
    id: z.string(),
    number: z.number(),
    companyId: z.string(),
});

export type WithdrawItemReservationResponse = z.infer<typeof WithdrawItemReservationResponseSchema>;
export type WithdrawnBatch = z.infer<typeof WithdrawnBatchSchema>;
export type WithdrawnPosition = z.infer<typeof WithdrawnPositionSchema>;
