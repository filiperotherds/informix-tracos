import z from "zod";

export const createEstLocReserEndSchema = z.object({
  cod_empresa: z.string(),
  id: z.number(),
});

export type CreateEstLocReserEndSchema = z.infer<typeof createEstLocReserEndSchema>;