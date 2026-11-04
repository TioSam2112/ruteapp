"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TrendingUp,
  Percent,
  Scale,
  Layers,
  Barcode,
  Tag,
  AlertCircle,
} from "lucide-react";
import { createProduct, updateProduct } from "@/services/products.service";
import {
  productSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/schemas/product.schema";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { UNIT_MEASURE_OPTIONS, FRACTIONAL_UNITS } from "@/constants/units";
import { calculateProfitAndMargin, formatCurrency } from "@/utils/pricing";
import type { Product, UnidadMedida } from "@/types/product";

interface ProductFormProps {
  productToEdit?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({
  productToEdit,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEdit = Boolean(productToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: productToEdit?.nombre ?? "",
      sku: productToEdit?.sku ?? "",
      categoria: productToEdit?.categoria ?? "",
      unidadMedida: productToEdit?.unidadMedida ?? "UNIDAD",
      permiteDecimales: productToEdit?.permiteDecimales ?? false,
      costoUnitario: productToEdit?.costoUnitario ?? 0,
      precioVenta: productToEdit?.precioVenta ?? 0,
      stockActual: productToEdit?.stockActual ?? 0,
      stockMinimo: productToEdit?.stockMinimo ?? "",
    },
  });

  const unidadMedida = useWatch({ control, name: "unidadMedida" });
  const costoUnitario = useWatch({ control, name: "costoUnitario" }) || 0;
  const precioVenta = useWatch({ control, name: "precioVenta" }) || 0;
  const permiteDecimales = useWatch({ control, name: "permiteDecimales" });

  useEffect(() => {
    if (productToEdit) {
      reset({
        nombre: productToEdit.nombre,
        sku: productToEdit.sku,
        categoria: productToEdit.categoria,
        unidadMedida: productToEdit.unidadMedida,
        permiteDecimales: productToEdit.permiteDecimales,
        costoUnitario: productToEdit.costoUnitario,
        precioVenta: productToEdit.precioVenta,
        stockActual: productToEdit.stockActual,
        stockMinimo: productToEdit.stockMinimo ?? "",
      });
    } else {
      reset({
        nombre: "",
        sku: "",
        categoria: "",
        unidadMedida: "UNIDAD",
        permiteDecimales: false,
        costoUnitario: 0,
        precioVenta: 0,
        stockActual: 0,
        stockMinimo: "",
      });
    }
  }, [productToEdit, reset]);

  const handleUnidadChange = (unit: UnidadMedida) => {
    setValue("unidadMedida", unit);
    if (!productToEdit) {
      const isFractional = (FRACTIONAL_UNITS as readonly UnidadMedida[]).includes(unit);
      setValue("permiteDecimales", isFractional);
    }
  };

  const { gananciaBruta, margenPorcentaje } = calculateProfitAndMargin(
    costoUnitario,
    precioVenta
  );

  const onSubmit = async (values: ProductFormOutput) => {
    try {
      const stockMinimoValue =
        values.stockMinimo !== "" && values.stockMinimo !== undefined
          ? Number(values.stockMinimo)
          : undefined;

      if (isEdit && productToEdit) {
        await updateProduct(productToEdit.id, {
          nombre: values.nombre,
          sku: values.sku,
          codigo: values.sku,
          categoria: values.categoria,
          unidadMedida: values.unidadMedida,
          permiteDecimales: values.permiteDecimales,
          costoUnitario: Number(values.costoUnitario),
          precioVenta: Number(values.precioVenta),
          stockActual: Number(values.stockActual),
          stockMinimo: stockMinimoValue,
        });
      } else {
        await createProduct({
          nombre: values.nombre,
          sku: values.sku,
          codigo: values.sku,
          categoria: values.categoria,
          unidadMedida: values.unidadMedida,
          permiteDecimales: values.permiteDecimales,
          costoUnitario: Number(values.costoUnitario),
          precioVenta: Number(values.precioVenta),
          stockActual: Number(values.stockActual),
          stockMinimo: stockMinimoValue,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError("root", {
        message:
          error?.message ||
          "Ocurrió un error al guardar el producto. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="nombre" className="text-xs font-medium text-foreground">
            Nombre del producto <span className="text-destructive">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Ej. Queso Costeño Premium, Tornillo Hexagonal 1/2..."
            disabled={isSubmitting}
            {...register("nombre")}
            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {errors.nombre && (
            <p className="px-1 text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sku" className="text-xs font-medium text-foreground">
            Código / SKU interno <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Barcode size={16} />
            </span>
            <input
              id="sku"
              type="text"
              placeholder="Ej. PROD-001 o 7701234567"
              disabled={isSubmitting}
              {...register("sku")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm uppercase text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 font-mono"
            />
          </div>
          {errors.sku && (
            <p className="px-1 text-xs text-destructive">{errors.sku.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="categoria" className="text-xs font-medium text-foreground">
            Categoría <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Tag size={15} />
            </span>
            <input
              id="categoria"
              type="text"
              list="categories-list"
              placeholder="Selecciona o escribe una categoría"
              disabled={isSubmitting}
              {...register("categoria")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <datalist id="categories-list">
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          {errors.categoria && (
            <p className="px-1 text-xs text-destructive">
              {errors.categoria.message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-accent/20 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Scale size={15} className="text-primary" />
              <span>Unidad de Medida & Pesaje</span>
              <span className="text-destructive">*</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Configura cómo se cuantifica y fracciona el producto en ventas y almacén.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="permiteDecimales"
              disabled={isSubmitting}
              {...register("permiteDecimales")}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span className="text-xs font-medium text-foreground">
              Permitir venta fraccionada (decimales)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {UNIT_MEASURE_OPTIONS.map((item) => {
            const isSelected = unidadMedida === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleUnidadChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl border text-center transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border-border/60 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span className="text-xs leading-tight">{item.label}</span>
                <span
                  className={`text-[10px] font-mono mt-0.5 ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground/80"
                  }`}
                >
                  {item.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="costoUnitario"
            className="text-xs font-medium text-foreground"
          >
            Costo Unitario ($) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-semibold text-xs">
              $
            </span>
            <input
              id="costoUnitario"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              disabled={isSubmitting}
              {...register("costoUnitario")}
              className="w-full rounded-xl border border-border bg-input pl-8 pr-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.costoUnitario && (
            <p className="px-1 text-xs text-destructive">
              {errors.costoUnitario.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="precioVenta"
            className="text-xs font-medium text-foreground"
          >
            Precio de Venta ($ PVP) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground font-semibold text-xs">
              $
            </span>
            <input
              id="precioVenta"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              disabled={isSubmitting}
              {...register("precioVenta")}
              className="w-full rounded-xl border border-border bg-input pl-8 pr-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.precioVenta && (
            <p className="px-1 text-xs text-destructive">
              {errors.precioVenta.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp size={15} className="text-primary" />
          <span>Ganancia estimada por unidad:</span>
          <span
            className={`font-semibold font-mono ${
              gananciaBruta >= 0 ? "text-foreground" : "text-destructive"
            }`}
          >
            {formatCurrency(gananciaBruta)}
          </span>
        </div>
        {margenPorcentaje !== null && (
          <div className="flex items-center gap-1.5 font-medium">
            <Percent size={13} className="text-muted-foreground" />
            <span className="text-muted-foreground">Margen:</span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                Number(margenPorcentaje) >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {margenPorcentaje}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="stockActual"
              className="text-xs font-medium text-foreground"
            >
              Stock Inicial <span className="text-destructive">*</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              {permiteDecimales ? "Acepta decimales" : "Solo enteros"}
            </span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Layers size={15} />
            </span>
            <input
              id="stockActual"
              type="number"
              step={permiteDecimales ? "any" : "1"}
              min="0"
              placeholder="0"
              disabled={isSubmitting}
              {...register("stockActual")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.stockActual && (
            <p className="px-1 text-xs text-destructive">
              {errors.stockActual.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="stockMinimo"
              className="text-xs font-medium text-foreground"
            >
              Stock Mínimo (Alerta)
            </label>
            <span className="text-[11px] text-muted-foreground">Opcional</span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <AlertCircle size={15} />
            </span>
            <input
              id="stockMinimo"
              type="number"
              step={permiteDecimales ? "any" : "1"}
              min="0"
              placeholder="Ej. 5"
              disabled={isSubmitting}
              {...register("stockMinimo")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.stockMinimo && (
            <p className="px-1 text-xs text-destructive">
              {errors.stockMinimo.message}
            </p>
          )}
        </div>
      </div>

      {errors.root && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
          <p className="text-xs text-destructive">{errors.root.message}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-border/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? isEdit
              ? "Actualizando..."
              : "Guardando..."
            : isEdit
            ? "Guardar cambios"
            : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
