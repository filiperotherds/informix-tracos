import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const cancelMaterialReserveBodySchema = z.object({
    tracos_id: z.coerce.string(),
});

export type CancelMaterialReserveBodySchema = z.infer<typeof cancelMaterialReserveBodySchema>;
export class CancelMaterialReserveDto extends createZodDto(cancelMaterialReserveBodySchema) { }

