import z from "zod";

export const serviceOrderBodySchema = z.object({
  num_os: z.coerce.string().max(10),
  cod_equip: z.string(),
});

export type ServiceOrderBodySchema = z.infer<typeof serviceOrderBodySchema>;