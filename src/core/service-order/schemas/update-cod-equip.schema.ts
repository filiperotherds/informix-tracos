import z from "zod";

export const updateCodEquipSchema = z.object({
    cod_empresa: z.string().optional(),
    num_os: z.string(),
    cod_equip: z.string(),
    cod_cent_trab: z.number().optional(),
});

export type UpdateCodEquipSchema = z.infer<typeof updateCodEquipSchema>;