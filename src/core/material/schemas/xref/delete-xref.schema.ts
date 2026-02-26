import z from "zod";

export const deleteXrefSchema = z.object({
    tracosId: z.coerce.string(),
});

export type DeleteXrefSchema = z.infer<typeof deleteXrefSchema>;