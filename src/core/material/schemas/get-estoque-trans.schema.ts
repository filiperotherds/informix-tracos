import z from "zod";

export const getEstoqueTransSchema = z.object({
    cod_empresa: z.string(),
    cod_item: z.string(),
    num_transac: z.number()
});

export type GetEstoqueTransSchema = z.infer<typeof getEstoqueTransSchema>;