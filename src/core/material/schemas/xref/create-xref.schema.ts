import z from "zod";

export const createXrefSchema = z.object({
    logixId: z.coerce.string(),
    tracosId: z.coerce.string(),
});

export type CreateXrefSchema = z.infer<typeof createXrefSchema>;