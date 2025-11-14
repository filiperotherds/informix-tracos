import { z } from "zod";

export const equipmentDataSchema = z.object({
    cod_equip: z.string(),
    cod_uni_funcio: z.coerce.number(),
    cod_empresa: z.string(),
})

export type EquipmentDataSchema = z.infer<
    typeof equipmentDataSchema
>