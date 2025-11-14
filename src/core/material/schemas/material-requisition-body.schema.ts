import z from "zod";

export const createMaterialRequisitionBodySchema = z.object({
  cod_item: z.coerce.string(),
  qtd_reserva: z.coerce.number(),
  num_os: z.string(),
});

export type CreateMaterialRequisitionBodySchema = z.infer<typeof createMaterialRequisitionBodySchema>;