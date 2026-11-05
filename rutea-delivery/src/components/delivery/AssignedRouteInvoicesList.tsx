"use client";

import { CheckCircle2, Eye, FileText, MapPin, Phone, Wallet } from "lucide-react";
import { formatPosCurrency, type Order } from "@rutea/shared";
import { ALL_ROUTE_CITIES_FILTER, DELIVERY_PAYMENT_METHODS, ROUTE_ORDER_STATUS_META } from "@/constants/delivery";
import type { AssignedCityInvoiceGroup } from "@/types/delivery";
import { resolveOrderExpectedAmount } from "@/utils/dispatch";

export interface AssignedRouteInvoicesListProps {
  cityGroups: readonly AssignedCityInvoiceGroup[];
  visibleCityGroups: readonly AssignedCityInvoiceGroup[];
  selectedCity: string;
  onSelectCity: (ciudad: string) => void;
  onInspectOrder: (order: Order) => void;
  activeCollectionOrderId: string | null;
  onToggleCollectionCard: (orderId: string) => void;
}

export function AssignedRouteInvoicesList({
  cityGroups, visibleCityGroups, selectedCity, onSelectCity,
  onInspectOrder, activeCollectionOrderId, onToggleCollectionCard,
}: AssignedRouteInvoicesListProps) {
  const totalInvoicesCount = cityGroups.reduce((acc, g) => acc + g.totalFacturas, 0);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Cola de Facturas de la Ruta Asignada
          </h2>
          <p className="text-xs text-muted-foreground">
            Facturas vinculadas exclusivamente a tu sesión de reparto, agrupadas por población.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectCity(ALL_ROUTE_CITIES_FILTER)}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-3.5 text-xs font-semibold transition-all ${
              selectedCity === ALL_ROUTE_CITIES_FILTER
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Todas</span>
            <span className="rounded-full bg-background/20 px-2 py-0.5 text-[11px]">
              {totalInvoicesCount}
            </span>
          </button>

          {cityGroups.map((group) => (
            <button
              key={group.ciudad}
              type="button"
              onClick={() => onSelectCity(group.ciudad)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border px-3.5 text-xs font-semibold transition-all ${
                selectedCity === group.ciudad
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin size={13} />
              <span>{group.ciudad}</span>
              <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[11px] text-foreground">
                {group.totalFacturas}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visibleCityGroups.map((group) => (
        <div
          key={group.ciudad}
          className="overflow-hidden rounded-3xl border border-border/50 bg-card/90 shadow-xs backdrop-blur-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/30 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {group.ciudad}
                  </h3>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {group.totalFacturas} {group.totalFacturas === 1 ? "factura" : "facturas"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {group.entregadasCount} entregadas • {group.pendientesCount} pendientes
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Total Población
              </p>
              <p className="text-sm font-bold text-foreground sm:text-base">
                {formatPosCurrency(group.totalMontoEsperado)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            {group.orders.map((order) => {
              const expectedAmount = resolveOrderExpectedAmount(order);
              const statusMeta = ROUTE_ORDER_STATUS_META[order.estado] ?? {
                label: order.estado,
                className: "border-border bg-muted text-muted-foreground",
              };
              const isExpanded = activeCollectionOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className="flex flex-col justify-between gap-3.5 rounded-2xl border border-border/50 bg-background/80 p-4 transition-all hover:border-primary/30"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                          <FileText size={12} />
                          {order.facturaNumber}
                        </span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          A Cobrar
                        </p>
                        <p className="text-base font-bold tracking-tight text-foreground">
                          {formatPosCurrency(expectedAmount)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {order.clientData.nombre}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-primary" />
                          {order.clientData.direccion || "Sin dirección registrada"}
                        </span>
                        {order.clientData.telefono && (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} />
                            {order.clientData.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        Modalidad de Recaudo Lista para Registro
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {DELIVERY_PAYMENT_METHODS.map((method) => (
                          <div
                            key={method.id}
                            className="flex min-h-[44px] items-center justify-center rounded-xl border border-border/60 bg-background px-2 text-center text-xs font-medium text-foreground"
                          >
                            {method.shortLabel}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-t border-border/40 pt-3">
                    <button
                      type="button"
                      onClick={() => onInspectOrder(order)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Eye size={15} />
                      <span>Detalle ({order.items.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleCollectionCard(order.id)}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-95 active:scale-[0.99]"
                    >
                      {order.estado === "ENTREGADO" ? <CheckCircle2 size={15} /> : <Wallet size={15} />}
                      <span>Registrar Cobro y Entrega</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
