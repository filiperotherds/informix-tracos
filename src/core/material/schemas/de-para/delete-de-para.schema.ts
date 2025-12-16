import z from "zod";

export const deleteDeParaSchema = z.object({
    tracosId: z.coerce.string(),
});

export type DeleteDeParaSchema = z.infer<typeof deleteDeParaSchema>;