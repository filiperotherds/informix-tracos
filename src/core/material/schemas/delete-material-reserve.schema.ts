import { z } from "zod";

export const deleteMaterialReserveSchema = z.object({
    cod_empresa: z.string(),
    num_reserva: z.number()
})

export type DeleteMaterialReserveSchema = z.infer<typeof deleteMaterialReserveSchema>
