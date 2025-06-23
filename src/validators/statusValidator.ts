import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["nový", "hotovo"]),
});

export type StatusBody = z.infer<typeof statusSchema>;
