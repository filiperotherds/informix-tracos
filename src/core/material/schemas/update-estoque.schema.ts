import z from "zod";

export const updateEstoque = z.object({
    qtd_reserva: z.coerce.number(),
    cod_empresa: z.string(),
    cod_item: z.string()
});

export type UpdateEstoque = z.infer<typeof updateEstoque>;