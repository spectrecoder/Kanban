import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Must be 4 or more characters long" })
    .max(15, { message: "Must be 15 or fewer characters long" })
    .transform((val) => val.trim()),
  image: z.string().optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(4, { message: "Must be 4 or more characters long" })
    .max(15, { message: "Must be 15 or fewer characters long" }),
});
