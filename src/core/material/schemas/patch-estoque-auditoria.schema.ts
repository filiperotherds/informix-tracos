import z from "zod";

export const patchEstoqueAuditoriaSchema = z.object({
    cod_empresa: z.string(),
    num_transac: z.coerce.number(),
});

export type PatchEstoqueAuditoriaSchema = z.infer<typeof patchEstoqueAuditoriaSchema>;