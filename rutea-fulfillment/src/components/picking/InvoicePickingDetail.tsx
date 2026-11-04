"use client";

import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Order, PickingAuditUser } from "@rutea/shared";
import {
  calculateOrderPickingProgress,
  formatPendingItemsCopy,
} from "@/utils/fulfillment";
import { useOrderPickingActions } from "@/hooks/useOrderPickingActions";
import { PickingOrderHeaderCard } from "@/components/picking/PickingOrderHeaderCard";
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
  const {
    isCompleting,
    isTogglingObs,
    actionError,
    handleUpdateItem,
    handleToggleGeneralObservation,
    handleCompleteFulfillment,
  } = useOrderPickingActions({
    order,
    auditUser,
    onOrderCompleted,
  });

  const stats = calculateOrderPickingProgress(order);
  const ciudadLabel =
    order.clientData.ciudad?.trim() || "Sin población especificada";

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

        <PickingOrderHeaderCard
          order={order}
          ciudadLabel={ciudadLabel}
          isTogglingObs={isTogglingObs}
          onToggleGeneralObservation={handleToggleGeneralObservation}
        />

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
