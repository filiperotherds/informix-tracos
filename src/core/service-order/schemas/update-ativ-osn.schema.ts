import z from "zod";

export const updateAtivOsn = z.object({
    des_serv_exec: z.string(),
    cod_empresa: z.string(),
    num_os: z.string(),
    cod_equip: z.string(),
});

export type UpdateAtivOsn = z.infer<typeof updateAtivOsn>;