"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Hash,
  Phone,
  Navigation,
  MapPin,
  UserCheck,
  Printer,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  PackageX,
  MessageSquareWarning,
  CornerDownRight,
  Clock,
  Loader2,
  AlertCircle,
  Columns2,
  History,
  FileCheck2,
} from "lucide-react";
import {
  approveOrderForDelivery,
  formatPosCurrency,
  type Order,
  type PickingAuditLog,
  type PickingAuditUser,
} from "@rutea/shared";
import {
  buildOrderReliquidationComparison,
  formatQuantityValue,
  formatSellerOrderTime,
  getSellerOrderStatusMeta,
  type OrderItemComparison,
} from "@/utils/reliquidation";
import { PosReceiptPrint } from "@/components/facturation/PosReceiptPrint";

export interface InvoiceComparisonDetailProps {
  order: Order;
  sellerAudit?: PickingAuditUser;
  onClose?: () => void;
  onOrderApproved?: (updatedOrder: Order) => void;
}

type InspectionViewMode = "COMPARATIVO" | "INICIAL" | "ALISTADA";

function formatAuditTime(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatAuditBadgeCopy(audit?: PickingAuditLog): string | null {
  if (!audit) return null;
  const user = audit.userName.trim() || "Operador";
  const time = formatAuditTime(audit.timestamp);
  return time ? `${user} • ${time}` : user;
}

function ItemChangeBadge({ item }: { item: OrderItemComparison }) {
  switch (item.changeType) {
    case "AGOTADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
          <PackageX size={12} />
          <span>Agotado en bodega (0 {item.unidadMedida})</span>
        </span>
      );
    case "CANTIDAD_REDUCIDA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          <Scale size={12} />
          <span>
            Ajuste: {formatQuantityValue(item.deltaCantidad)}{" "}
            {item.unidadMedida} ({formatPosCurrency(item.deltaSubtotal)})
          </span>
        </span>
      );
    case "CANTIDAD_AUMENTADA":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <Scale size={12} />
          <span>
            Ajuste: +{formatQuantityValue(item.deltaCantidad)}{" "}
            {item.unidadMedida} (+{formatPosCurrency(item.deltaSubtotal)})
          </span>
        </span>
      );
    case "PENDIENTE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Clock size={12} />
          <span>En revisión de bodega</span>
        </span>
      );
    case "SIN_CAMBIO":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 size={12} />
          <span>Alistado completo</span>
        </span>
      );
  }
}

export function InvoiceComparisonDetail({
  order,
  sellerAudit,
  onClose,
  onOrderApproved,
}: InvoiceComparisonDetailProps) {
  const [viewMode, setViewMode] = useState<InspectionViewMode>("COMPARATIVO");
  const [isApproving, setIsApproving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const comparison = useMemo(
    () => buildOrderReliquidationComparison(order),
    [order]
  );

  const statusMeta = getSellerOrderStatusMeta(order.estado);
  const ciudadLabel =
    order.clientData.ciudad?.trim() || "Sin población especificada";
  const vendedorLabel = order.vendedorNombre?.trim() || "Preventa";
  const canSendToDelivery = order.estado === "ALISTADO";
  const isAlreadyDispatched =
    order.estado === "LISTO_PARA_REPARTO" ||
    order.estado === "EN_RUTA" ||
    order.estado === "ENTREGADO";

  const generalObsAuditCopy = formatAuditBadgeCopy(
    order.generalObservationAudit
  );

  const handleSendToDelivery = async () => {
    if (!canSendToDelivery) return;
    setActionError(null);
    setIsApproving(true);

    try {
      const updated = await approveOrderForDelivery(order.id, sellerAudit);
      onOrderApproved?.(updated);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo aprobar la factura para reparto."
      );
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-card/85 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar panel de detalle"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <ArrowLeft size={14} />
                <span>Volver</span>
              </button>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-base font-bold tracking-tight text-foreground sm:text-lg">
                  Factura #{order.facturaNumber}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-xs font-medium text-foreground">
                  <MapPin size={12} className="text-primary" />
                  {ciudadLabel}
                </span>
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {statusMeta.label}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {order.clientData.nombre} • Creada el{" "}
                {formatSellerOrderTime(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-accent active:scale-[0.98]"
            >
              <Printer size={15} className="text-primary" />
              <span>Imprimir Factura POS</span>
            </button>

            <button
              type="button"
              onClick={handleSendToDelivery}
              disabled={!canSendToDelivery || isApproving}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                isAlreadyDispatched
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              }`}
            >
              {isApproving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Enviando a reparto...</span>
                </>
              ) : isAlreadyDispatched ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Enviada a Reparto (Delivery)</span>
                </>
              ) : (
                <>
                  <Truck size={15} />
                  <span>Enviar a Reparto (Delivery)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4 pb-12 sm:p-6">
        {actionError && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <section
          aria-label="Resumen de re-liquidación"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Versión Inicial (Preventa)
              </span>
              <History size={14} className="text-muted-foreground" />
            </div>
            <p className="mt-1.5 font-mono text-xl font-bold text-foreground">
              {formatPosCurrency(comparison.initialVersion.total)}
            </p>
            <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>PROD: {comparison.initialVersion.prodCount}</span>
              <span>•</span>
              <span>
                ART: {formatQuantityValue(comparison.initialVersion.artCount)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-2xs ring-1 ring-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Versión Alistada (Final Bodega)
              </span>
              <FileCheck2 size={14} className="text-primary" />
            </div>
            <p className="mt-1.5 font-mono text-xl font-bold text-primary">
              {formatPosCurrency(comparison.pickedVersion.total)}
            </p>
            <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>PROD: {comparison.pickedVersion.prodCount}</span>
              <span>•</span>
              <span>
                ART: {formatQuantityValue(comparison.pickedVersion.artCount)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Diferencia Re-liquidación
              </span>
              <Scale size={14} className="text-muted-foreground" />
            </div>
            <p
              className={`mt-1.5 font-mono text-xl font-bold ${
                comparison.summary.diferencia < 0
                  ? "text-amber-600"
                  : comparison.summary.diferencia > 0
                    ? "text-emerald-600"
                    : "text-foreground"
              }`}
            >
              {comparison.summary.diferencia > 0 ? "+" : ""}
              {formatPosCurrency(comparison.summary.diferencia)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {comparison.hasChanges
                ? `${comparison.modifiedItems.length} ajuste(s) peso/cant. • ${comparison.agotadosItems.length} agotado(s)`
                : "100% idéntica a la factura inicial"}
            </p>
          </div>
        </section>

        <section
          aria-label="Datos del cliente y observación general"
          className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-4"
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Building2 size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Cliente / Comercio
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {order.clientData.nombre}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                <Hash size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  NIT / Identificación
                </p>
                <p className="truncate font-mono text-sm font-medium text-foreground">
                  {order.clientData.nit?.trim() || "No especificado"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                <Phone size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </p>
                <p className="truncate font-mono text-sm font-medium text-foreground">
                  {order.clientData.telefono?.trim() || "No registrado"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                <Navigation size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Dirección
                </p>
                <p className="text-sm font-medium text-foreground">
                  {order.clientData.direccion?.trim() || "Sin dirección"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                <MapPin size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Población
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {ciudadLabel}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-muted-foreground">
                <UserCheck size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Facturador / Cierre
                </p>
                <p className="truncate text-sm font-medium text-foreground">
                  {vendedorLabel}
                  {comparison.summary.closedByName && (
                    <span className="block text-[11px] text-muted-foreground">
                      Cerrado por: {comparison.summary.closedByName}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {comparison.generalObservation && (
            <div
              className={`rounded-xl border p-3.5 ${
                comparison.generalObservationChecked
                  ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                  : "border-amber-500/35 bg-amber-500/[0.06]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    size={14}
                    className={
                      comparison.generalObservationChecked
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Observación General de Factura
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    comparison.generalObservationChecked
                      ? "bg-emerald-500/15 text-emerald-700"
                      : "bg-amber-500/15 text-amber-700"
                  }`}
                >
                  {comparison.generalObservationChecked ? (
                    <>
                      <CheckCircle2 size={11} />
                      <span>
                        Verificada en bodega
                        {generalObsAuditCopy ? ` (${generalObsAuditCopy})` : ""}
                      </span>
                    </>
                  ) : (
                    <span>Pendiente de check en bodega</span>
                  )}
                </span>
              </div>

              <p className="mt-1.5 font-mono text-xs font-medium uppercase text-foreground">
                {comparison.generalObservation}
              </p>
            </div>
          )}
        </section>

        <section aria-label="Inspección de productos" className="space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Detalle de Productos ({comparison.items.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Compara lo facturado en preventa frente al peso/cantidad real
                despachado por bodega.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Modo de visualización de versión"
              className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-accent/60 p-1 self-start"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "COMPARATIVO"}
                onClick={() => setViewMode("COMPARATIVO")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "COMPARATIVO"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns2 size={13} />
                <span>Comparativo</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "INICIAL"}
                onClick={() => setViewMode("INICIAL")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "INICIAL"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History size={13} />
                <span>Versión Inicial</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "ALISTADA"}
                onClick={() => setViewMode("ALISTADA")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "ALISTADA"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCheck2 size={13} />
                <span>Versión Alistada</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {comparison.items.map((item) => {
              const auditCopy = formatAuditBadgeCopy(item.picked.lastPickedBy);

              return (
                <article
                  key={`${item.id_producto}-${item.itemIndex}`}
                  className={`rounded-2xl border p-4 transition-colors ${
                    item.changeType === "AGOTADO"
                      ? "border-destructive/30 bg-destructive/[0.03]"
                      : item.hasDiscrepancy
                        ? "border-amber-500/35 bg-amber-500/[0.03]"
                        : "border-border/60 bg-card"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                            {item.sku}
                          </span>
                          <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {item.unidadMedida}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatPosCurrency(item.precioUnitario)} c/u
                          </span>
                        </div>

                        <h4
                          className={`mt-1 text-sm font-semibold ${
                            item.changeType === "AGOTADO" &&
                            viewMode === "ALISTADA"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {item.nombre}
                        </h4>

                        {item.observationItem && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-lg border border-primary/15 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-medium uppercase text-primary">
                            <CornerDownRight size={11} className="shrink-0" />
                            <span>Obs. Preventa: {item.observationItem}</span>
                          </div>
                        )}
                      </div>

                      {viewMode !== "INICIAL" && (
                        <ItemChangeBadge item={item} />
                      )}
                    </div>

                    {viewMode === "COMPARATIVO" && (
                      <div className="grid grid-cols-1 gap-2.5 border-t border-border/40 pt-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/50 bg-accent/30 px-3 py-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Pedido Inicial (Preventa)
                          </span>
                          <div className="mt-1 flex items-baseline justify-between font-mono">
                            <span className="text-xs font-semibold text-foreground">
                              {formatQuantityValue(item.initial.cantidad)}{" "}
                              {item.unidadMedida}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {formatPosCurrency(item.initial.subtotal)}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl border px-3 py-2 ${
                            item.changeType === "AGOTADO"
                              ? "border-destructive/30 bg-destructive/10"
                              : item.hasDiscrepancy
                                ? "border-amber-500/35 bg-amber-500/10"
                                : "border-emerald-500/30 bg-emerald-500/10"
                          }`}
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                            Real Alistado (Bodega)
                          </span>
                          <div className="mt-1 flex items-baseline justify-between font-mono">
                            <span className="text-xs font-bold text-foreground">
                              {formatQuantityValue(
                                item.picked.cantidadAlistada
                              )}{" "}
                              {item.unidadMedida}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {formatPosCurrency(item.picked.subtotalAlistado)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {viewMode === "INICIAL" && (
                      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 font-mono text-xs">
                        <span className="text-muted-foreground">
                          Cantidad facturada:{" "}
                          <strong className="text-foreground">
                            {formatQuantityValue(item.initial.cantidad)}{" "}
                            {item.unidadMedida}
                          </strong>
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatPosCurrency(item.initial.subtotal)}
                        </span>
                      </div>
                    )}

                    {viewMode === "ALISTADA" && (
                      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 font-mono text-xs">
                        <span className="text-muted-foreground">
                          Cantidad alistada:{" "}
                          <strong className="text-foreground">
                            {formatQuantityValue(item.picked.cantidadAlistada)}{" "}
                            {item.unidadMedida}
                          </strong>
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {formatPosCurrency(item.picked.subtotalAlistado)}
                        </span>
                      </div>
                    )}

                    {viewMode !== "INICIAL" &&
                      (item.picked.pickerNote || auditCopy) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/30 pt-2 text-xs">
                          {item.picked.pickerNote ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800">
                              <MessageSquareWarning
                                size={13}
                                className="shrink-0"
                              />
                              <span>
                                Nota Alistador: {item.picked.pickerNote}
                              </span>
                            </div>
                          ) : (
                            <span />
                          )}

                          {auditCopy && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <UserCheck size={12} />
                              <span>Alistado por {auditCopy}</span>
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <PosReceiptPrint
        order={order}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultVersion={viewMode === "INICIAL" ? "INICIAL" : "ALISTADA"}
      />
    </div>
  );
}

