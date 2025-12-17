import z from "zod";

export const createEstoqueTransSchema = z.object({
    cod_empresa: z.string(),
    cod_item: z.string(),
    num_docum: z.string(),
    qtd_movto: z.number(),
    num_conta: z.string(),
    num_secao_requis: z.string()
});

export type CreateEstoqueTransSchema = z.infer<typeof createEstoqueTransSchema>;