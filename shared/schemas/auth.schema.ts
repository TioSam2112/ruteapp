import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Correo electrónico inválido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginFormOutput = z.output<typeof loginSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
