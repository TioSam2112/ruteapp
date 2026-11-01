"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  MapPin,
  FileText,
  ChevronRight,
  Inbox,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import type { Order } from "@rutea/shared";
import {
  filterFulfillmentOrders,
  getFulfillmentFilterCounts,
  getOrderQueueCardSummary,
  groupOrdersByCityFIFO,
  type FulfillmentFilterMode,
} from "@/utils/fulfillment";

export interface InvoiceQueueListProps {
  orders: readonly Order[];
  selectedOrderId?: string | null;
  onSelectOrder: (order: Order) => void;
  isLoading?: boolean;
}

interface FilterSegmentOption {
  mode: FulfillmentFilterMode;
  label: string;
}

const FILTER_SEGMENTS: readonly FilterSegmentOption[] = [
  { mode: "HOY", label: "Hoy" },
  { mode: "TODAS", label: "Disponibles" },
  { mode: "PENDIENTE_LLEGADA", label: "Con Pendientes" },
] as const;

export function InvoiceQueueList({
  orders,
  selectedOrderId,
  onSelectOrder,
  isLoading = false,
}: InvoiceQueueListProps) {
  const [activeFilter, setActiveFilter] =
    useState<FulfillmentFilterMode>("TODAS");

  const filterCounts = useMemo(
    () => getFulfillmentFilterCounts(orders),
    [orders]
  );

  const cityGroups = useMemo(() => {
    const filtered = filterFulfillmentOrders(orders, activeFilter);
    return groupOrdersByCityFIFO(filtered);
  }, [orders, activeFilter]);

  return (
    <section
      aria-label="Cola de facturas por alistar"
      className="flex h-full flex-col bg-background"
    >
      <div className="sticky top-0 z-20 border-b border-border/50 bg-background/85 px-4 pt-3 pb-3 backdrop-blur-xl">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Cola de Facturas
          </h1>
          <span className="text-xs font-medium text-muted-foreground">
            {filterCounts[activeFilter]}{" "}
            {filterCounts[activeFilter] === 1 ? "factura" : "facturas"}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Filtrar facturas"
          className="grid grid-cols-3 gap-1 rounded-xl bg-accent/85 p-1"
        >
          {FILTER_SEGMENTS.map(({ mode, label }) => {
            const isSelected = activeFilter === mode;
            const count = filterCounts[mode];
            const isPendingTab = mode === "PENDIENTE_LLEGADA";

            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveFilter(mode)}
                className={`flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? "bg-card font-semibold text-foreground shadow-xs"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                {isPendingTab && (
                  <Clock
                    size={12.5}
                    className={
                      count > 0
                        ? "shrink-0 text-amber-500"
                        : "shrink-0 text-muted-foreground"
                    }
                  />
                )}
                <span className="truncate">{label}</span>
                <span
                  className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.2 font-mono text-[10px] leading-4 ${
                    isSelected
                      ? isPendingTab && count > 0
                        ? "bg-amber-500/15 font-semibold text-amber-600"
                        : "bg-primary/10 font-semibold text-primary"
                      : "bg-background/60 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-8">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="h-36 animate-pulse rounded-2xl border border-border/50 bg-card p-4"
              />
            ))}
          </div>
        ) : cityGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/80 text-muted-foreground">
              <Inbox size={20} strokeWidth={1.7} />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No hay facturas en esta vista
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {activeFilter === "HOY"
                ? "Aún no se registran facturas del día de hoy pendientes por alistar."
                : activeFilter === "PENDIENTE_LLEGADA"
                  ? "Ninguna factura tiene productos marcados como pendientes de llegada."
                  : "Todas las facturas disponibles han sido alistadas."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {cityGroups.map((group) => (
              <div key={group.ciudad} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin
                      size={13.5}
                      strokeWidth={2}
                      className="shrink-0 text-primary"
                    />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.ciudad}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {group.pendingArrivalOrders > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        <Clock size={10} />
                        {group.pendingArrivalOrders}
                      </span>
                    )}
                    <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      {group.totalOrders}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {group.orders.map((order) => {
                    const summary = getOrderQueueCardSummary(order);
                    const isSelected = selectedOrderId === order.id;

                    const statusBadgeClasses =
                      summary.statusMeta.tone === "in_progress"
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : summary.statusMeta.tone === "completed"
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                          : "border-border bg-accent/70 text-muted-foreground";

                    const progressFillClasses =
                      summary.stats.progressPercentage === 100
                        ? "bg-emerald-500"
                        : summary.hasPendingArrival
                          ? "bg-amber-500"
                          : "bg-primary";

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className={`group relative flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.985] ${
                          isSelected
                            ? "border-primary bg-primary/[0.03] shadow-xs ring-2 ring-primary/15"
                            : "border-border/70 bg-card shadow-2xs hover:border-border hover:bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-accent/80 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-foreground">
                              {order.facturaNumber}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <Clock size={11.5} className="shrink-0" />
                              {summary.arrivalTimeLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-tight ${statusBadgeClasses}`}
                            >
                              {summary.statusMeta.label}
                            </span>
                            <ChevronRight
                              size={15}
                              className={`transition-transform duration-150 ${
                                isSelected
                                  ? "translate-x-0.5 text-primary"
                                  : "text-muted-foreground/60 group-hover:translate-x-0.5 group-hover:text-foreground"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                            {order.clientData.nombre}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <UserCheck size={12.5} className="shrink-0" />
                            <span className="truncate">
                              Facturó:{" "}
                              <strong className="font-medium text-foreground/85">
                                {summary.vendedorLabel}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {(summary.hasGeneralObservation ||
                          summary.hasPendingArrival) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {summary.hasPendingArrival && (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                                <Clock size={11.5} className="shrink-0" />
                                {summary.stats.pendientesLlegadaCount}{" "}
                                {summary.stats.pendientesLlegadaCount === 1
                                  ? "pendiente por llegar"
                                  : "pendientes por llegar"}
                              </span>
                            )}

                            {summary.hasGeneralObservation && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${
                                  summary.isGeneralObservationChecked
                                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                                    : "border-primary/25 bg-primary/10 text-primary"
                                }`}
                              >
                                {summary.isGeneralObservationChecked ? (
                                  <CheckCircle2
                                    size={11.5}
                                    className="shrink-0"
                                  />
                                ) : (
                                  <FileText size={11.5} className="shrink-0" />
                                )}
                                Observación general
                              </span>
                            )}
                          </div>
                        )}

                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">
                              {summary.progressCopy}
                            </span>
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {summary.percentageLabel}
                            </span>
                          </div>

                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
                            <div
                              style={{
                                width: `${summary.stats.progressPercentage}%`,
                              }}
                              className={`h-full rounded-full transition-all duration-300 ease-out ${progressFillClasses}`}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

