import { z } from "zod";

export const equipmentCostCenterSchema = z.object({
    cod_uni_funcio: z.number(),
    cod_empresa: z.string(),
})

export type EquipmentCostCenterSchema = z.infer<
    typeof equipmentCostCenterSchema
>