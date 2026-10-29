import { z } from "zod";
import type { UserRole } from "@/types/auth";

export const createUserSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  apellido: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres."),
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
  rol: z.enum(["admin", "facturation", "picker", "delivery"], {
    message: "Selecciona un rol válido.",
  }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const editUserSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  apellido: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres."),
  email: z.string().trim().email(),
  rol: z.enum(["admin", "facturation", "picker", "delivery"], {
    message: "Selecciona un rol válido.",
  }),
  password: z.string().optional(),
});

export type CreateUserFormInput = z.input<typeof createUserSchema>;
export type CreateUserFormOutput = z.output<typeof createUserSchema>;
export type EditUserFormInput = z.input<typeof editUserSchema>;
export type EditUserFormOutput = z.output<typeof editUserSchema>;

export type UserFormValues = {
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  password?: string;
};
