import z from "zod";

export const createSchema = z.object({
    cod_empresa: z.string(),
    num_os: z.string(),
    cod_cent_trab: z.number(),
    cod_equip: z.string(),
});

export type CreateSchema = z.infer<typeof createSchema>;