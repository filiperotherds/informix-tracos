import z from "zod";

export const getAllMaterialSchema = z.array(
    z.object({
        cod_logix: z.coerce.string(),
        preco_unit: z.number(),
        saldo_estoque: z.number(),
        estoque: z.string()
    })
);

export type GetAllMaterialSchema = z.infer<typeof getAllMaterialSchema>;