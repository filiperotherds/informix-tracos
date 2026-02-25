import { z } from 'zod';

export const BalanceSchema = z.object({
    stockQuantity: z.number(),
    availableQuantity: z.number(),
    reservedQuantity: z.number(),
});

export const InboundBatchSchema = z.object({
    itemStorageId: z.string(),
    inboundBatchId: z.string(),
    quantity: z.number(),
    inboundBatchName: z.string(),
    inboundBatchUnitPrice: z.number(),
    inboundBatchEntryDate: z.string(),
});

export const DeletedInfoSchema = z.object({
    value: z.boolean(),
    reason: z.string().nullable(),
    deletedAt: z.string().nullable(),
    deletedByUserId: z.string().nullable(),
    restoredByUserId: z.string().nullable(),
    restoredAt: z.string().nullable(),
});

export const StoragePositionSchema = z.object({
    quantity: z.number(),
    storageId: z.string(),
    totalPrice: z.number(),
    storageName: z.string(),
    itemStorageId: z.string(),
    path: z.array(z.string()),
});

export const ItemStorageDataSchema = z.object({
    id: z.string(),
    itemId: z.string(),
    storageId: z.string(),
    storageName: z.string(),
    createdAt: z.string(),
    createdByUserId: z.string(),
    balance: BalanceSchema,
    companyId: z.string(),
    inboundBatches: z.array(InboundBatchSchema),
    maxStorage: z.number().nullable(),
    minStorage: z.number().nullable(),
    supplyPoint: z.number().nullable(),
    averagePrice: z.number().nullable(),
    updatedAt: z.string(),
    updatedByUserId: z.string(),
    deleted: DeletedInfoSchema,
    identifierCode: z.string().nullable(),
    stockLevel: z.string(),
    totalPrice: z.number().nullable(),
    storagePositions: z.array(StoragePositionSchema),
});

export const GetItemStorageResponseSchema = z.object({
    data: z.array(ItemStorageDataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasNextPage: z.boolean(),
});

export type GetItemStorageResponse = z.infer<typeof GetItemStorageResponseSchema>;
export type ItemStorageData = z.infer<typeof ItemStorageDataSchema>;
