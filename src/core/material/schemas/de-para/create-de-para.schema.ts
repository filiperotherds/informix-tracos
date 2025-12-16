import z from "zod";

export const createDeParaSchema = z.object({
    logixId: z.coerce.string(),
    tracosId: z.coerce.string(),
});

export type CreateDeParaSchema = z.infer<typeof createDeParaSchema>;