import z from "zod";

export const patchEstoqueTransEndSchema = z.object({
    cod_empresa: z.string(),
    num_transac: z.coerce.number(),
    qtd_reserva: z.coerce.number(),
    cod_item: z.coerce.string(),
});

export type PatchEstoqueTransEndSchema = z.infer<typeof patchEstoqueTransEndSchema>;