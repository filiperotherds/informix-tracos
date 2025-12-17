import z from "zod";

export const createEstoqueLocReserSchema = z.object({
  cod_empresa: z.string(),
  cod_item: z.coerce.string(),
  qtd_reserva: z.coerce.number(),
  num_os: z.string(),
  cod_equip: z.coerce.string(),
  num_conta_deb: z.string(),
  cod_uni_funcio: z.coerce.number(),
});

export type CreateEstoqueLocReserSchema = z.infer<typeof createEstoqueLocReserSchema>;