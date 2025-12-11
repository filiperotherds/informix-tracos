import z from "zod";

export const patchEestoqueTransRevSchema = z.object({
    cod_empresa: z.string(),
    num_transac_old: z.coerce.number(),
    num_transac: z.coerce.number(),
});

export type PatchEestoqueTransRevSchema = z.infer<typeof patchEestoqueTransRevSchema>;