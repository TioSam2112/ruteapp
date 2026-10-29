import { z } from "zod";

export const clientSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre del cliente debe tener al menos 2 caracteres."),
  nombreComercio: z.string().trim().optional(),
  telefono: z
    .string()
    .trim()
    .min(7, "El teléfono debe tener al menos 7 dígitos.")
    .regex(/^[0-9+\s()-]+$/, "Ingresa un número de teléfono válido."),
  correo: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido.")
    .or(z.literal(""))
    .optional(),
  direccion: z
    .string()
    .trim()
    .min(3, "La dirección de entrega es obligatoria."),
  ciudad: z
    .string()
    .trim()
    .min(2, "La ciudad o población es obligatoria."),
});

export type ClientFormInput = z.input<typeof clientSchema>;
export type ClientFormOutput = z.output<typeof clientSchema>;
