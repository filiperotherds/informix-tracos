import z from "zod";

export const updateEstoqueLote = z.object({
    qtd_reversao: z.number(),
    cod_empresa: z.string(),
    cod_item: z.string()
});

export type UpdateEstoqueLote = z.infer<typeof updateEstoqueLote>;