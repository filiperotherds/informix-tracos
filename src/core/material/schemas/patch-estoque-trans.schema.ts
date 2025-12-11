import z from "zod";

export const patchEstoqueTransSchema = z.object({
    cod_item: z.coerce.string(),
    num_os: z.string(),
    qtd_reserva: z.coerce.number(),
    cod_empresa: z.string(),
    num_conta_deb: z.string(),
});

export type PatchEstoqueTransSchema = z.infer<typeof patchEstoqueTransSchema>;