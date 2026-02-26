import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateMaterialReserveBodySchema = z.object({
    tracos_id: z.coerce.string(),
    new_value: z.coerce.number(),
});

export type UpdateMaterialReserveBodySchema = z.infer<typeof updateMaterialReserveBodySchema>;
export class UpdateMaterialReserveDto extends createZodDto(updateMaterialReserveBodySchema) { }