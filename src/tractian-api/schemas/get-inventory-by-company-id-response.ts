import { z } from 'zod';

export const DeletedInfoSchema = z.object({
    value: z.boolean(),
    reason: z.string().nullable(),
    deletedAt: z.string().nullable(),
    deletedByUserId: z.string().nullable(),
    restoredByUserId: z.string().nullable(),
    restoredAt: z.string().nullable(),
});

export const DisabledInfoSchema = z.object({
    value: z.boolean(),
    reason: z.string().nullable(),
    disabledAt: z.string().nullable(),
    disabledByUserId: z.string().nullable(),
    enabledByUserId: z.string().nullable(),
    enabledAt: z.string().nullable(),
});

export const ItemCodeSchema = z.object({
    type: z.string(),
    value: z.string(),
});

export const ForecastedBalanceSchema = z.object({
    next30DaysAvailableQuantity: z.number(),
    next60DaysAvailableQuantity: z.number(),
    next90DaysAvailableQuantity: z.number(),
    next30DaysInboundQuantity: z.number(),
    next60DaysInboundQuantity: z.number(),
    next90DaysInboundQuantity: z.number(),
    next30DaysOutboundQuantity: z.number(),
    next60DaysOutboundQuantity: z.number(),
    next90DaysOutboundQuantity: z.number(),
});

export const ItemSummarySchema = z.object({
    storageLocations: z.array(z.string()),
    availableQuantity: z.number(),
    stockLevel: z.string(),
    reservedQuantity: z.number(),
    stockQuantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    quantityInTransit: z.number(),
    forecastedBalance: ForecastedBalanceSchema,
});

export const ItemCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const FullMeasurementUnitSchema = z.object({
    id: z.string(),
    name: z.string(),
    plural: z.string(),
    abbreviation: z.string(),
    companyId: z.string(),
    createdByUserId: z.string(),
    createdAt: z.string(),
    updatedByUserId: z.string(),
    updatedAt: z.string(),
    key: z.string(),
    deleted: DeletedInfoSchema,
    disabled: DisabledInfoSchema,
});

export const LibraryInfoSchema = z.object({
    importRefId: z.string().nullable(),
    packageVersionId: z.string().nullable(),
    itemId: z.string().nullable(),
});

export const ItemDataSchema = z.object({
    id: z.string(),
    name: z.string(),
    companyId: z.string(),
    number: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdByUserId: z.string(),
    updatedByUserId: z.string(),
    deleted: DeletedInfoSchema,
    disabled: DisabledInfoSchema,
    identifierCode: z.string().nullable(),
    code: ItemCodeSchema,
    description: z.string(),
    measurementUnitId: z.string(),
    stockValuationMethod: z.string(),
    itemCategoryId: z.string(),
    abcClassification: z.string().nullable(),
    xyzClassification: z.string().nullable(),
    ncmAndHsCode: z.string(),
    tags: z.array(z.string()),
    leadTime: z.number().nullable(),
    imageId: z.string().nullable(),
    isService: z.boolean(),
    assignedUserIds: z.array(z.any()),
    assignedTeamIds: z.array(z.any()),
    purchaseUserIds: z.array(z.any()),
    purchaseTeamIds: z.array(z.any()),
    attachmentIds: z.array(z.string()).nullable(),
    supplierIds: z.array(z.any()),
    attachments: z.array(z.any()),
    summary: ItemSummarySchema,
    itemStorages: z.any().nullable(),
    itemCategory: ItemCategorySchema,
    customFields: z.any().nullable(),
    identifierCodeOrNumber: z.string(),
    search: z.string(),
    purchaseUserOids: z.array(z.any()),
    purchaseTeamOids: z.array(z.any()),
    quantityInTransit: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    availableQuantity: z.number(),
    reservedQuantity: z.number(),
    stockQuantity: z.number(),
    next30DaysAvailableQuantity: z.number(),
    next60DaysAvailableQuantity: z.number(),
    next90DaysAvailableQuantity: z.number(),
    next30DaysInboundQuantity: z.number(),
    next60DaysInboundQuantity: z.number(),
    next90DaysInboundQuantity: z.number(),
    next30DaysOutboundQuantity: z.number(),
    next60DaysOutboundQuantity: z.number(),
    next90DaysOutboundQuantity: z.number(),
    measurementUnit: FullMeasurementUnitSchema,
    forecastedBalance: ForecastedBalanceSchema,
    libraryInfo: LibraryInfoSchema,
});

export const GetInventoryByCompanyIdResponseSchema = z.object({
    data: z.array(ItemDataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasNextPage: z.boolean(),
});

export type GetInventoryByCompanyIdResponse = z.infer<typeof GetInventoryByCompanyIdResponseSchema>;
export type ItemData = z.infer<typeof ItemDataSchema>;