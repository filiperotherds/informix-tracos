import z from "zod";

export const materialReserveBodySchema = z.object({
    cod_item: z.coerce.string(),
    qtd_reserva: z.coerce.number(),
    num_os: z.string(),
    tracos_id: z.coerce.string(),
});

export type MaterialReserveBodySchema = z.infer<typeof materialReserveBodySchema>;