"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  Package,
  Scale,
} from "lucide-react";
import { deleteProduct } from "@/services/products.service";
import { UNIT_BADGE_CONFIG } from "@/constants/units";
import {
  getStockStatus,
  formatProductPrice,
  formatQuantity,
} from "@/utils/product";
import { DeleteProductDialog } from "@/components/admin/products/DeleteProductDialog";
import type { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

export function ProductsTable({ products, onEdit }: ProductsTableProps) {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    } catch {
      setDeleteError("No se pudo eliminar el producto. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((product) => {
          const unitBadge =
            UNIT_BADGE_CONFIG[product.unidadMedida] ?? UNIT_BADGE_CONFIG.UNIDAD;
          const stockStatus = getStockStatus(
            product.stockActual,
            product.stockMinimo
          );
          const ganancia = product.precioVenta - product.costoUnitario;
          const margen =
            product.costoUnitario > 0
              ? ((ganancia / product.costoUnitario) * 100).toFixed(0)
              : null;

          return (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 shadow-xs backdrop-blur-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-accent/70 px-1.5 py-0.5 rounded-md">
                      {product.sku}
                    </span>
                    <span className="text-[11px] text-muted-foreground bg-accent/30 px-1.5 py-0.5 rounded-md border border-border/40">
                      {product.categoria}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-foreground text-sm leading-tight truncate">
                    {product.nombre}
                  </h3>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${unitBadge.className}`}
                  >
                    {unitBadge.label}
                  </span>
                  {product.permiteDecimales && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono">
                      <Scale size={10} />
                      Frac.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-accent/20 p-2.5 border border-border/30 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">
                    Precio Venta (PVP)
                  </span>
                  <span className="font-semibold text-foreground text-sm font-mono">
                    {formatProductPrice(product.precioVenta)}
                  </span>
                  {margen !== null && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                      +{margen}% margen
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">
                    Inventario Actual
                  </span>
                  <span className="font-semibold text-foreground font-mono text-sm">
                    {formatQuantity(product.stockActual, product.permiteDecimales)}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      {unitBadge.short}
                    </span>
                  </span>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.2 text-[9px] font-medium mt-0.5 ${stockStatus.className}`}
                    >
                      {stockStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-2 text-xs">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Costo: {formatProductPrice(product.costoUnitario)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(product)}
                    aria-label={`Editar ${product.nombre}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Edit2 size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setProductToDelete(product)}
                    aria-label={`Eliminar ${product.nombre}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-accent/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-5 py-3.5">
                  Producto / SKU
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Categoría
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Unidad
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Costo
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Precio PVP
                </th>
                <th scope="col" className="px-4 py-3.5 text-center">
                  Margen
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Stock
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {products.map((product) => {
                const unitBadge =
                  UNIT_BADGE_CONFIG[product.unidadMedida] ?? UNIT_BADGE_CONFIG.UNIDAD;
                const stockStatus = getStockStatus(
                  product.stockActual,
                  product.stockMinimo
                );
                const ganancia = product.precioVenta - product.costoUnitario;
                const margen =
                  product.costoUnitario > 0
                    ? ((ganancia / product.costoUnitario) * 100).toFixed(1)
                    : null;

                return (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-accent/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground">
                          <Package size={17} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[220px]">
                            {product.nombre}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {product.sku}
                            </span>
                            {product.permiteDecimales && (
                              <span className="inline-flex items-center gap-0.5 rounded-sm bg-accent/60 px-1 text-[9px] text-muted-foreground">
                                <Scale size={9} /> Decimales
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg border border-border/40 bg-accent/20 px-2 py-0.5 text-xs text-foreground font-medium">
                        {product.categoria}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${unitBadge.className}`}
                      >
                        {unitBadge.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground">
                      {formatProductPrice(product.costoUnitario)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-foreground">
                      {formatProductPrice(product.precioVenta)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {margen !== null ? (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold font-mono ${
                            Number(margen) >= 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {Number(margen) >= 0 ? "+" : ""}
                          {margen}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {formatQuantity(
                            product.stockActual,
                            product.permiteDecimales
                          )}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            {unitBadge.short}
                          </span>
                        </span>
                        <span
                          className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-medium ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(product)}
                          aria-label={`Editar ${product.nombre}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Edit2 size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          aria-label={`Eliminar ${product.nombre}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteProductDialog
        product={productToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setProductToDelete(null)}
      />
    </>
  );
}
