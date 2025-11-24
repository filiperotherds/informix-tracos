import z from "zod";

export const createServiceOrderBodySchema = z.object({
  num_os: z.coerce.string().max(10),
  cod_equip: z.string(),
});

export type CreateServiceOrderBodySchema = z.infer<typeof createServiceOrderBodySchema>;