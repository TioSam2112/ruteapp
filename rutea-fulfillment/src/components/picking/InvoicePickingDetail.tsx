"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  Phone,
  Building2,
  Hash,
  Navigation,
  UserCheck,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  completeOrderFulfillment,
  toggleGeneralObservationCheck,
  updateOrderItemPicking,
  type Order,
  type OrderItemPickingPatch,
  type PickingAuditUser,
} from "@rutea/shared";
import {
  calculateOrderPickingProgress,
  formatOrderArrivalTime,
  formatPendingItemsCopy,
  formatPickingAuditTrail,
} from "@/utils/fulfillment";
import { PickingItemRow } from "@/components/picking/PickingItemRow";

export interface InvoicePickingDetailProps {
  order: Order;
  auditUser: PickingAuditUser;
  onBackToQueue: () => void;
  onOrderCompleted?: (orderId: string) => void;
}

export function InvoicePickingDetail({
  order,
  auditUser,
  onBackToQueue,
  onOrderCompleted,
}: InvoicePickingDetailProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTogglingObs, setIsTogglingObs] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = calculateOrderPickingProgress(order);
  const hasGeneralObservation = Boolean(order.generalObservation?.trim());
  const isGeneralObsChecked = Boolean(order.generalObservationChecked);
  const generalObsAuditText = formatPickingAuditTrail(
    order.generalObservationAudit,
    isGeneralObsChecked
  );

  const ciudadLabel =
    order.clientData.ciudad?.trim() || "Sin población especificada";
  const vendedorLabel = order.vendedorNombre?.trim() || "Preventa";

  const handleUpdateItem = async (
    itemIndex: number,
    patch: OrderItemPickingPatch
  ) => {
    setActionError(null);
    try {
      await updateOrderItemPicking(order.id, itemIndex, patch, auditUser);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el producto en Firestore."
      );
    }
  };

  const handleToggleGeneralObservation = async () => {
    setActionError(null);
    setIsTogglingObs(true);
    try {
      await toggleGeneralObservationCheck(
        order.id,
        !isGeneralObsChecked,
        auditUser
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la observación general."
      );
    } finally {
      setIsTogglingObs(false);
    }
  };

  const handleCompleteFulfillment = async () => {
    setActionError(null);
    setIsCompleting(true);
    try {
      await completeOrderFulfillment(order.id, auditUser);
      onOrderCompleted?.(order.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo finalizar el alistamiento de la factura."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/85 px-4 py-3 backdrop-blur-xl saturate-150 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToQueue}
              aria-label="Volver a la cola de facturas"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 text-xs font-semibold text-foreground transition-all duration-150 hover:bg-accent active:scale-[0.97] lg:hidden"
            >
              <ArrowLeft size={15} />
              <span>Cola</span>
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Factura #{order.facturaNumber}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-accent/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
                  <MapPin size={12} className="text-primary" />
                  {ciudadLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatPendingItemsCopy(stats)} • {stats.progressPercentage}%
                completado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompleteFulfillment}
            disabled={isCompleting}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary-hover active:scale-[0.97] disabled:opacity-60 sm:text-sm"
          >
            {isCompleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Finalizando…</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} strokeWidth={2.2} />
                <span>Finalizar Alistamiento</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-5 pb-12 sm:px-6">
        {actionError && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <section
          aria-label="Metadatos del pedido"
          className="rounded-2xl border border-border/60 bg-[#F2F2F7] p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-2xs">
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
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-2xs">
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
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-2xs">
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
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-2xs">
                <Navigation size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Dirección de entrega
                </p>
                <p className="text-sm font-medium text-foreground">
                  {order.clientData.direccion?.trim() || "Sin dirección"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-2xs">
                <MapPin size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Ciudad / Población
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {ciudadLabel}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-2xs">
                <UserCheck size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Vendedor / Facturador
                </p>
                <p className="truncate text-sm font-medium text-foreground">
                  {vendedorLabel}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({formatOrderArrivalTime(order.createdAt)})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {hasGeneralObservation && (
            <div
              className={`mt-4 rounded-2xl border p-4 transition-colors duration-150 ${
                isGeneralObsChecked
                  ? "border-emerald-500/35 bg-card"
                  : "border-amber-500/40 bg-amber-500/[0.08]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle
                      size={14}
                      className={
                        isGeneralObsChecked
                          ? "shrink-0 text-emerald-600"
                          : "shrink-0 text-amber-600"
                      }
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Observación General de la Factura
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {order.generalObservation}
                  </p>

                  {generalObsAuditText && (
                    <p className="pt-1 text-[11px] text-muted-foreground">
                      {generalObsAuditText}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isGeneralObsChecked}
                  aria-label="Confirmar revisión de observación general"
                  onClick={handleToggleGeneralObservation}
                  disabled={isTogglingObs}
                  className={`flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border transition-all duration-150 active:scale-[0.95] disabled:opacity-60 ${
                    isGeneralObsChecked
                      ? "border-emerald-600 bg-emerald-500 text-white shadow-xs"
                      : "border-amber-500/50 bg-card text-muted-foreground hover:border-amber-500 hover:text-foreground"
                  }`}
                >
                  {isTogglingObs ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check
                      size={20}
                      strokeWidth={2.6}
                      className={isGeneralObsChecked ? "opacity-100" : "opacity-25"}
                    />
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        <section aria-label="Productos a alistar" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Productos de la Factura ({order.items.length})
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {stats.alistadosCount} alistados
              </span>
              {stats.pendientesLlegadaCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {stats.pendientesLlegadaCount} pendientes
                </span>
              )}
              {stats.agotadosCount > 0 && (
                <span className="inline-flex items-center gap-1 text-destructive">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  {stats.agotadosCount} agotados
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <PickingItemRow
                key={`${order.id}-${item.id_producto}-${idx}`}
                item={item}
                itemIndex={idx}
                onUpdateItem={handleUpdateItem}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

