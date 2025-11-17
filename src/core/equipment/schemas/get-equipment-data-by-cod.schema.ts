import { z } from "zod";

export const getEquipmentDataByCodSchema = z.object({
    cod_empresa: z.string(),
    cod_cent_trab: z.number(),
})

export type GetEquipmentDataByCodSchema = z.infer<
    typeof getEquipmentDataByCodSchema
>