"use client";

import { Truck, X } from "lucide-react";
import { formatPosCurrency } from "@rutea/shared";
import type { DispatchSelectionSummary } from "@/types/dispatch";

interface DispatchStickyBottomBarProps {
  selectionSummary: DispatchSelectionSummary;
  onClearSelection: () => void;
  onOpenCreateRoute: () => void;
}

export function DispatchStickyBottomBar({
  selectionSummary,
  onClearSelection,
  onOpenCreateRoute,
}: DispatchStickyBottomBarProps) {
  if (selectionSummary.totalPoblaciones === 0) return null;

  const pobLabel =
    selectionSummary.totalPoblaciones === 1
      ? "población seleccionada"
      : "poblaciones seleccionadas";
  const facLabel =
    selectionSummary.totalFacturas === 1 ? "factura" : "facturas";

  return (
    <div className="sticky bottom-4 z-30 mx-auto mt-4 w-full max-w-4xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-xl backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Limpiar selección"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {selectionSummary.totalPoblaciones} {pobLabel} •{" "}
              {selectionSummary.totalFacturas} {facLabel} •{" "}
              <span className="text-primary">
                {formatPosCurrency(selectionSummary.totalMontoEsperado)}
              </span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {selectionSummary.suggestedRouteName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateRoute}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 sm:w-auto"
        >
          <Truck size={16} />
          <span>Armar y Asignar Ruta</span>
        </button>
      </div>
    </div>
  );
}

