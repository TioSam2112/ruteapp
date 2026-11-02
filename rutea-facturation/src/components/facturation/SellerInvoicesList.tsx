"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  PackageCheck,
  Truck,
  Warehouse,
  Scale,
  PackageX,
  MessageSquareWarning,
  Search,
  X,
  ReceiptText,
  ChevronRight,
} from "lucide-react";
import {
  formatPosCurrency,
  type Order,
  type PickingAuditUser,
} from "@rutea/shared";
import { InvoiceComparisonDetail } from "@/components/facturation/InvoiceComparisonDetail";
import {
  buildOrderReliquidationComparison,
  filterSellerOrders,
  formatSellerOrderTime,
  getSellerInvoiceFilterCounts,
  getSellerOrderStatusMeta,
  groupSellerOrdersByCity,
  type SellerInvoiceFilterMode,
  type SellerOrderStatusMeta,
} from "@/utils/reliquidation";

export interface SellerInvoicesListProps {
  orders: readonly Order[];
  isLoading?: boolean;
  sellerAudit?: PickingAuditUser;
  selectedOrderId?: string | null;
  onSelectOrder?: (order: Order | null) => void;
  renderDetailPanel?: (
    order: Order,
    onClose: () => void
  ) => React.ReactNode;
}

const FILTER_SEGMENTS: readonly {
  mode: SellerInvoiceFilterMode;
  label: string;
}[] = [
  { mode: "TODAS", label: "Todas" },
  { mode: "EN_BODEGA", label: "En Bodega (Alistando)" },
  { mode: "LISTAS_PARA_VALIDAR", label: "Listas para Validar (Alistadas)" },
  { mode: "ENVIADAS_A_REPARTO", label: "Enviadas a Reparto" },
] as const;

function getStatusBadgeClasses(tone: SellerOrderStatusMeta["tone"]): string {
  switch (tone) {
    case "ready":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
    case "picking":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700";
    case "delivery":
      return "border-primary/30 bg-primary/10 text-primary";
    case "cancelled":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "warehouse":
    default:
      return "border-border bg-accent text-muted-foreground";
  }
}

function StatusIcon({ tone }: { tone: SellerOrderStatusMeta["tone"] }) {
  switch (tone) {
    case "ready":
      return <PackageCheck size={12} className="shrink-0" />;
    case "picking":
      return <Warehouse size={12} className="shrink-0" />;
    case "delivery":
      return <Truck size={12} className="shrink-0" />;
    default:
      return <Warehouse size={12} className="shrink-0" />;
  }
}

export function SellerInvoicesList({
  orders,
  isLoading = false,
  sellerAudit,
  selectedOrderId: controlledSelectedId,
  onSelectOrder,
  renderDetailPanel,
}: SellerInvoicesListProps) {
  const [filterMode, setFilterMode] =
    useState<SellerInvoiceFilterMode>("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null
  );

  const activeSelectedId =
    controlledSelectedId !== undefined
      ? controlledSelectedId
      : internalSelectedId;

  const handleSelect = (order: Order | null) => {
    if (controlledSelectedId === undefined) {
      setInternalSelectedId(order?.id ?? null);
    }
    onSelectOrder?.(order);
  };

  const counts = useMemo(
    () => getSellerInvoiceFilterCounts(orders),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const byMode = filterSellerOrders(orders, filterMode);
    const q = searchTerm.trim().toLowerCase();
    if (!q) return byMode;

    return byMode.filter(
      (o) =>
        o.facturaNumber.toLowerCase().includes(q) ||
        o.clientData.nombre.toLowerCase().includes(q) ||
        (o.clientData.ciudad && o.clientData.ciudad.toLowerCase().includes(q)) ||
        (o.clientData.nit && o.clientData.nit.toLowerCase().includes(q))
    );
  }, [orders, filterMode, searchTerm]);

  const cityGroups = useMemo(
    () => groupSellerOrdersByCity(filteredOrders),
    [filteredOrders]
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === activeSelectedId) ?? null,
    [orders, activeSelectedId]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background lg:flex-row">
      <div
        className={`flex h-full w-full flex-col overflow-hidden border-border/40 bg-background transition-all ${
          selectedOrder
            ? "hidden lg:flex lg:w-[460px] lg: shrink-0 lg:border-r xl:w-[520px]"
            : "flex flex-1"
        }`}
      >
        <div className="border-b border-border/40 bg-card/80 px-4 py-3.5 backdrop-blur-md sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por #Factura, cliente, NIT o población..."
                className="w-full rounded-xl border border-border/80 bg-input py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 sm:text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div
              role="tablist"
              aria-label="Filtrar facturas por estado"
              className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/50 bg-accent/60 p-1"
            >
              {FILTER_SEGMENTS.map(({ mode, label }) => {
                const isActive = filterMode === mode;
                const count = counts[mode];

                return (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setFilterMode(mode)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="whitespace-nowrap">{label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-semibold ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-background/70 text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-28 animate-pulse rounded-2xl border border-border/40 bg-card/60"
                />
              ))}
            </div>
          ) : cityGroups.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
                <ReceiptText size={22} strokeWidth={1.6} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No hay facturas en esta vista
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                No se encontraron facturas para el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {cityGroups.map((group) => (
                <section
                  key={group.ciudad}
                  aria-label={`Población ${group.ciudad}`}
                  className="space-y-2.5"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-border/50 bg-sidebar/95 px-3 py-2 backdrop-blur-md">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="shrink-0 text-primary" />
                      <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-foreground">
                        {group.ciudad}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      {group.readyToReliquidateCount > 0 && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700">
                          {group.readyToReliquidateCount} por validar
                        </span>
                      )}
                      <span className="rounded-full bg-card px-2 py-0.5 font-mono text-xs font-semibold text-foreground border border-border/50">
                        {group.totalOrders}{" "}
                        {group.totalOrders === 1 ? "factura" : "facturas"}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`grid gap-2.5 ${
                      selectedOrder
                        ? "grid-cols-1"
                        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {group.orders.map((order) => {
                      const isSelected = order.id === activeSelectedId;
                      const statusMeta = getSellerOrderStatusMeta(order.estado);
                      const comparison =
                        buildOrderReliquidationComparison(order);
                      const isAlistadaOrLater =
                        order.estado === "ALISTADO" ||
                        order.estado === "LISTO_PARA_REPARTO" ||
                        order.estado === "EN_RUTA" ||
                        order.estado === "ENTREGADO";

                      const modifiedCount = comparison.modifiedItems.length;
                      const agotadosCount = comparison.agotadosItems.length;
                      const notesCount = comparison.itemsWithNotes.length;

                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => handleSelect(order)}
                          className={`group flex w-full flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-150 ${
                            isSelected
                              ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-sm"
                              : "border-border/60 bg-card hover:border-primary/40 hover:shadow-xs"
                          }`}
                        >
                          <div className="space-y-2 w-full">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-foreground">
                                  #{order.facturaNumber}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock size={11} />
                                  {formatSellerOrderTime(order.createdAt)}
                                </span>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClasses(
                                  statusMeta.tone
                                )}`}
                              >
                                <StatusIcon tone={statusMeta.tone} />
                                <span>{statusMeta.label}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 min-w-0">
                              <Building2
                                size={14}
                                className="shrink-0 text-muted-foreground"
                              />
                              <p className="truncate text-sm font-semibold text-foreground">
                                {order.clientData.nombre}
                              </p>
                            </div>

                            {isAlistadaOrLater ? (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {!comparison.hasChanges ? (
                                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                    <CheckCircle2 size={11} />
                                    <span>Alistada sin diferencias</span>
                                  </span>
                                ) : (
                                  <>
                                    {modifiedCount > 0 && (
                                      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                        <Scale size={11} />
                                        <span>
                                          {modifiedCount}{" "}
                                          {modifiedCount === 1
                                            ? "ajuste de peso/cant."
                                            : "ajustes de peso/cant."}
                                        </span>
                                      </span>
                                    )}
                                    {agotadosCount > 0 && (
                                      <span className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                                        <PackageX size={11} />
                                        <span>
                                          {agotadosCount}{" "}
                                          {agotadosCount === 1
                                            ? "agotado"
                                            : "agotados"}
                                        </span>
                                      </span>
                                    )}
                                  </>
                                )}

                                {notesCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-accent px-2 py-0.5 text-[11px] font-medium text-foreground">
                                    <MessageSquareWarning size={11} />
                                    <span>
                                      {notesCount}{" "}
                                      {notesCount === 1 ? "nota" : "notas"}
                                    </span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 pt-1">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{
                                      width: `${order.pickingProgress ?? 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {order.pickingProgress ?? 0}% alistado
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex w-full items-center justify-between border-t border-border/40 pt-2.5 text-xs">
                            <div className="flex items-baseline gap-2">
                              <span className="text-muted-foreground">
                                Total:
                              </span>
                              <span className="font-mono text-sm font-bold text-foreground">
                                {formatPosCurrency(
                                  isAlistadaOrLater
                                    ? comparison.pickedVersion.total
                                    : comparison.initialVersion.total
                                )}
                              </span>
                              {isAlistadaOrLater && comparison.hasChanges && (
                                <span className="font-mono text-[11px] text-muted-foreground line-through">
                                  {formatPosCurrency(
                                    comparison.initialVersion.total
                                  )}
                                </span>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                              <span>Revisar</span>
                              <ChevronRight size={14} />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <aside
          aria-label="Detalle comparativo de factura"
          className="flex h-full flex-1 flex-col overflow-y-auto bg-background"
        >
          {renderDetailPanel ? (
            renderDetailPanel(selectedOrder, () => handleSelect(null))
          ) : (
            <InvoiceComparisonDetail
              order={selectedOrder}
              sellerAudit={sellerAudit}
              onClose={() => handleSelect(null)}
            />
          )}
        </aside>
      )}
    </div>
  );
}

