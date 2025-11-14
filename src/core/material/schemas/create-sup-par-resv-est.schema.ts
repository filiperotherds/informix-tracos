import z from "zod";

export const crateSupParResvEstSchema = z.object({
    cod_empresa: z.string(),
    requisitionId: z.number(),
    parametro: z.string(),
    des_parametro: z.string(),
    parametro_ind: z.string().nullable(),
    parametro_texto: z.string().nullable(),
    parametro_val: z.number().nullable(),
    parametro_num: z.number().nullable(),
});

export type CrateSupParResvEstSchema = z.infer<typeof crateSupParResvEstSchema>;