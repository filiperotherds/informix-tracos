import z from "zod";

export const createEstoqueTransEndSchema = z.object({
    cod_empresa: z.string(),
    num_transac: z.coerce.number(),
    qtd_movto: z.number(),
    cod_item: z.string(),
});

export type CreateEstoqueTransEndSchema = z.infer<typeof createEstoqueTransEndSchema>;