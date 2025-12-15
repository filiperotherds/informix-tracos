import z from "zod";

export const createEstoqueTransRev = z.object({
    cod_empresa: z.string(),
    num_transac: z.coerce.number(),
    new_num_transac: z.coerce.number()
});

export type CreateEstoqueTransRev = z.infer<typeof createEstoqueTransRev>;