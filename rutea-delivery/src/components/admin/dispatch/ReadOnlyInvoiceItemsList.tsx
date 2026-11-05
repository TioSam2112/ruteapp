"use client";

import { MessageSquare, UserCheck } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import { ITEM_PICKING_STATUS_META } from "@/constants/dispatch";
import type { ReadOnlyItemComparisonRow } from "@/types/dispatch";
import {
  formatDispatchQuantity,
  formatDispatchTimestamp,
} from "@/utils/dispatch";

interface ReadOnlyInvoiceItemsListProps {
  rows: readonly ReadOnlyItemComparisonRow[];
}

export function ReadOnlyInvoiceItemsList({
  rows,
}: ReadOnlyInvoiceItemsListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Productos & Auditoría de Bodega ({rows.length})
        </h3>
        <span className="text-[11px] text-muted-foreground">
          Modo solo lectura
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, idx) => {
          const statusMeta = ITEM_PICKING_STATUS_META[row.status];
          const isAgotado = row.status === "AGOTADO";
          const deltaLabel =
            row.deltaCantidad > 0
              ? `+${formatDispatchQuantity(row.deltaCantidad)}`
              : formatDispatchQuantity(row.deltaCantidad);

          return (
            <div
              key={`${row.id_producto}-${idx}`}
              className={`rounded-2xl border p-3.5 transition-colors ${
                row.hasDiscrepancy
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border/50 bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                      {row.sku}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                    {row.hasDiscrepancy && !isAgotado && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        Ajuste: {deltaLabel} {row.unidadMedida}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm font-semibold text-foreground ${
                      isAgotado ? "line-through opacity-60" : ""
                    }`}
                  >
                    {row.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Precio unitario: {formatPosCurrency(row.precioUnitario)} /{" "}
                    {row.unidadMedida}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Pedido vs Alistado
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      <span>
                        {formatDispatchQuantity(row.cantidadOriginal)}{" "}
                        {row.unidadMedida}
                      </span>
                      <span className="mx-1.5 text-border">→</span>
                      <span className="font-semibold text-foreground">
                        {formatDispatchQuantity(row.cantidadAlistada)}{" "}
                        {row.unidadMedida}
                      </span>
                    </p>
                  </div>

                  <div className="min-w-[92px]">
                    <p className="text-[11px] text-muted-foreground">
                      Subtotal Alistado
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {formatPosCurrency(row.subtotalAlistado)}
                    </p>
                    {row.hasDiscrepancy && (
                      <p className="text-[11px] text-muted-foreground line-through">
                        {formatPosCurrency(row.subtotalOriginal)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(row.pickerNote || row.observationItem || row.pickerName) && (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-xs">
                  <div className="flex flex-col gap-1">
                    {row.observationItem && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Obs. Preventa:
                        </span>{" "}
                        {row.observationItem}
                      </p>
                    )}
                    {row.pickerNote && (
                      <p className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                        <MessageSquare size={13} className="shrink-0" />
                        <span>Nota Bodega: {row.pickerNote}</span>
                      </p>
                    )}
                  </div>

                  {row.pickerName && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <UserCheck size={12} />
                      <span>
                        {row.pickerName} •{" "}
                        {formatDispatchTimestamp(row.pickedAt)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

