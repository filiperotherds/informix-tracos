import z from "zod";

export const patchMaterialReserveBodySchema = z.object({
    cod_item: z.coerce.string(),
    qtd_reserva: z.coerce.number(),
    num_os: z.string(),
    tracos_id: z.coerce.string(),
});

export type PatchMaterialReserveBodySchema = z.infer<typeof patchMaterialReserveBodySchema>;