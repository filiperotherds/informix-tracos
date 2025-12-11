import z from "zod";

export const patchEstoqueTranComplSchema = z.object({
    cod_empresa: z.string(),
    num_transac: z.coerce.number(),
    num_os: z.string(),
});

export type PatchEstoqueTranComplSchema = z.infer<typeof patchEstoqueTranComplSchema>;