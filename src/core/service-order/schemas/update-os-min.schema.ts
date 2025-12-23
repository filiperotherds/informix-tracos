import z from "zod";

export const updateOsMin = z.object({
    ies_status_os: z.string(),
    cod_empresa: z.string(),
    num_os: z.string()
});

export type UpdateOsMin = z.infer<typeof updateOsMin>;