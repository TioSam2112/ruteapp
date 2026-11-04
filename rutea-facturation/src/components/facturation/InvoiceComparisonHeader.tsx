import {
  ArrowLeft,
  MapPin,
  Printer,
  Truck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { Order } from "@rutea/shared";
import { formatSellerOrderTime, getSellerOrderStatusMeta } from "@/utils/reliquidation";

interface InvoiceComparisonHeaderProps {
  order: Order;
  ciudadLabel: string;
  onClose?: () => void;
  onPrint: () => void;
  onSendToDelivery: () => void;
  canSendToDelivery: boolean;
  isApproving: boolean;
  isAlreadyDispatched: boolean;
}

export function InvoiceComparisonHeader({
  order,
  ciudadLabel,
  onClose,
  onPrint,
  onSendToDelivery,
  canSendToDelivery,
  isApproving,
  isAlreadyDispatched,
}: InvoiceComparisonHeaderProps) {
  const statusMeta = getSellerOrderStatusMeta(order.estado);

  return (
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
              {order.clientData.nombre} • Creada el {formatSellerOrderTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-accent active:scale-[0.98]"
          >
            <Printer size={15} className="text-primary" />
            <span>Imprimir Factura POS</span>
          </button>

          <button
            type="button"
            onClick={onSendToDelivery}
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
  );
}

