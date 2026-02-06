import { z } from 'zod';

export const cancelMaterialReserveBodySchema = z.object({
    tracos_id: z.coerce.string(),
});

export type CancelMaterialReserveBodySchema = z.infer<typeof cancelMaterialReserveBodySchema>;

