import { z } from "zod";

export const productSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
    sku: z.string().trim().min(1, "El código o SKU es obligatorio."),
    categoria: z.string().trim().min(2, "La categoría es obligatoria."),
    unidadMedida: z.enum(
      ["UNIDAD", "KILO", "GRAMO", "LITRO", "METRO", "CAJA"] as const,
      {
        message: "Selecciona una unidad de medida válida.",
      }
    ),
    permiteDecimales: z.boolean(),
    costoUnitario: z.coerce
      .number()
      .min(0, "El costo unitario no puede ser negativo."),
    precioVenta: z.coerce
      .number()
      .min(0, "El precio de venta no puede ser negativo."),
    stockActual: z.coerce
      .number()
      .min(0, "El stock actual no puede ser negativo."),
    stockMinimo: z.union([
      z.literal(""),
      z.coerce.number().min(0, "El stock mínimo no puede ser negativo."),
    ]).optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.permiteDecimales) {
      if (!Number.isInteger(val.stockActual)) {
        ctx.addIssue({
          code: "custom",
          message: "Esta unidad no permite decimales; el stock debe ser un número entero.",
          path: ["stockActual"],
        });
      }
      if (typeof val.stockMinimo === "number" && !Number.isInteger(val.stockMinimo)) {
        ctx.addIssue({
          code: "custom",
          message: "Esta unidad no permite decimales; el stock mínimo debe ser un número entero.",
          path: ["stockMinimo"],
        });
      }
    }
  });

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;
