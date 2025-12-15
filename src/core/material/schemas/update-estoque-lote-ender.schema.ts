import z from "zod";

export const updateEstoqueLoteEnder = z.object({
    qtd_saldo: z.coerce.number(),
    cod_empresa: z.string(),
    num_transac: z.number()
});

export type UpdateEstoqueLoteEnder = z.infer<typeof updateEstoqueLoteEnder>;