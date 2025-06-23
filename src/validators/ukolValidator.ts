// src/validators/ukolValidator.ts

import { z } from "zod";

export const ukolSchema = z.object({
  popis: z.string().min(1, "Popis je povinný"),
  najemnikId: z.number({
    required_error: "Nájemník ID je povinný",
    invalid_type_error: "Nájemník ID musí být číslo",
  }),
  status: z.enum(["nový", "probíhá", "hotovo"]).optional()
});

export const ukolUpdateSchema = z.object({
  popis: z.string().min(1, { message: "Popis je povinný." }),
  status: z.enum(["nový", "v řešení", "hotovo"]).optional(),
});

