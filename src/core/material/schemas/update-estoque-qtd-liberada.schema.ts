import { z } from 'zod';

export const updateEstoqueQtdLiberadaSchema = z.object({
    qtd_liberada: z.coerce.number(),
    cod_empresa: z.string(),
    cod_item: z.string(),
});

export type UpdateEstoqueQtdLiberada = z.infer<typeof updateEstoqueQtdLiberadaSchema>;
