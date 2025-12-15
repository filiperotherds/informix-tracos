import z from "zod";

export const getEstoqueLoteEnderSchema = z.object({
    cod_empresa: z.string(),
    cod_item: z.string(),
});

export type GetEstoqueLoteEnderSchema = z.infer<typeof getEstoqueLoteEnderSchema>;