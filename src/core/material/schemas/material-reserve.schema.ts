import z from "zod";

export const createMaterialReserveBodySchema = z.object({
  cod_item: z.coerce.string(),
  qtd_reserva: z.coerce.number(),
  num_os: z.string(),
  tracos_id: z.coerce.string(),
});

export type CreateMaterialReserveBodySchema = z.infer<typeof createMaterialReserveBodySchema>;