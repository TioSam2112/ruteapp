"use client";

import { Check, Eye, FileText, MapPin, User } from "lucide-react";
import { formatPosCurrency, type Order } from "@rutea/shared";
import type { CityDispatchGroup } from "@/types/dispatch";
import {
  formatDispatchTimestamp,
  resolveOrderExpectedAmount,
} from "@/utils/dispatch";

interface DispatchCityGroupCardProps {
  group: CityDispatchGroup;
  isSelected: boolean;
  onToggleSelect: (ciudad: string) => void;
  onInspectOrder: (order: Order) => void;
}

export function DispatchCityGroupCard({
  group,
  isSelected,
  onToggleSelect,
  onInspectOrder,
}: DispatchCityGroupCardProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border transition-all ${
        isSelected
          ? "border-primary bg-primary/[0.03] shadow-sm"
          : "border-border/50 bg-card"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggleSelect(group.ciudad)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleSelect(group.ciudad);
          }
        }}
        className="flex cursor-pointer flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-card/70 px-5 py-4 backdrop-blur-md transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-transparent"
            }`}
          >
            <Check size={15} strokeWidth={2.5} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {group.ciudad}
              </h3>
              <span className="rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                {group.totalFacturas}{" "}
                {group.totalFacturas === 1 ? "factura" : "facturas"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toca para incluir o excluir toda la población en la ruta
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Monto Esperado Población
          </p>
          <p className="text-base font-bold tracking-tight text-foreground">
            {formatPosCurrency(group.totalMontoEsperado)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/40">
        {group.orders.map((order) => {
          const expectedAmount = resolveOrderExpectedAmount(order);
          const itemCount = order.items.length;

          return (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {order.facturaNumber}
                    </span>
                    <span className="truncate text-sm font-semibold text-foreground">
                      {order.clientData.nombre}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      {order.clientData.direccion || "Sin dirección"}
                    </span>
                    {order.vendedorNombre && (
                      <span className="inline-flex items-center gap-1">
                        <User size={11} />
                        {order.vendedorNombre}
                      </span>
                    )}
                    <span>{formatDispatchTimestamp(order.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">
                    Total Alistado
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatPosCurrency(expectedAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onInspectOrder(order)}
                  title="Inspeccionar factura (Solo lectura)"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">Inspeccionar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

