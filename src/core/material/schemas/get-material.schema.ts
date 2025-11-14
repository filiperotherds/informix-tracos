import z from "zod";

export const getMaterialSchema = z.object({
    cod_item: z.coerce.string(),
    cod_empresa: z.string(),
});

export type GetMaterialSchema = z.infer<typeof getMaterialSchema>;