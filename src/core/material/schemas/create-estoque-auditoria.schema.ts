import z from "zod";

export const createEstoqueAuditoriaSchema = z.object({
    cod_empresa: z.string(),
    num_transac: z.coerce.number(),
});

export type CreateEstoqueAuditoriaSchema = z.infer<typeof createEstoqueAuditoriaSchema>;